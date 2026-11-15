/**
 * Centralized API client.
 *
 * All HTTP calls should go through `apiFetch` (JSON), `apiUpload` (multipart),
 * or `apiRaw` (non-JSON text/html). Endpoints are referenced exclusively from
 * `@/lib/endpoints` — never hardcode paths here.
 */

import { API_BASE, type Endpoint, resolveEndpoint } from "./endpoints";

export { endpoints, API_BASE, API_VERSION, resolveEndpoint } from "./endpoints";

interface ApiOptions extends RequestInit {
  /** Arguments for a parameterized endpoint function (e.g. `{ args: [id] }`). */
  args?: any[];
  /** Skip injecting the Authorization header (default: inject if token exists). */
  skipAuth?: boolean;
}

const getToken = (): string | null => localStorage.getItem("token");

const buildUrl = (endpoint: Endpoint, args: any[] = []): string =>
  `${API_BASE}${resolveEndpoint(endpoint, args)}`;

const authHeaders = (skipAuth?: boolean): HeadersInit => {
  const token = getToken();
  return !skipAuth && token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * JSON API request.
 *
 * @param endpoint - A static path string or an endpoint function from `endpoints`.
 * @param options  - Standard RequestInit plus `args` (for parameterized
 *                   endpoints) and `skipAuth`.
 *
 * Examples:
 *   apiFetch(endpoints.auth.login, { method: "POST", body: JSON.stringify(data) })
 *   apiFetch(endpoints.products.detail, { args: [id] })
 */
export const apiFetch = async <T = any>(
  endpoint: Endpoint,
  options: ApiOptions = {}
): Promise<T> => {
  const { args, skipAuth, headers, ...rest } = options;

  const res = await fetch(buildUrl(endpoint, args), {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(skipAuth),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json();
};

/**
 * Multipart form upload (e.g. images). Does NOT set Content-Type so the
 * browser can add the multipart boundary.
 */
export const apiUpload = async <T = any>(
  endpoint: Endpoint,
  formData: FormData,
  options: ApiOptions = {}
): Promise<T> => {
  const { args, skipAuth, headers, ...rest } = options;

  const res = await fetch(buildUrl(endpoint, args), {
    method: "POST",
    headers: {
      ...authHeaders(skipAuth),
      ...headers,
    },
    body: formData,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Upload failed");
  }

  return res.json();
};

/**
 * Raw response request for non-JSON endpoints (e.g. invoice HTML).
 * Returns the plain text body.
 */
export const apiRaw = async (
  endpoint: Endpoint,
  options: ApiOptions = {}
): Promise<string> => {
  const { args, skipAuth, headers, ...rest } = options;

  const res = await fetch(buildUrl(endpoint, args), {
    headers: {
      ...authHeaders(skipAuth),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.text();
};
