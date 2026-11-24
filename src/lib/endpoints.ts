/**
 * Centralized API Endpoint Configuration
 * ----------------------------------------
 * This module is the single source of truth for every API endpoint used by the
 * frontend. No page, component, hook, or service should hardcode an API path.
 *
 * Usage:
 *   import { endpoints, apiFetch } from "@/lib/api";
 *
 *   // Static endpoint
 *   await apiFetch(endpoints.auth.login, { method: "POST", body: ... });
 *
 *   // Parameterized endpoint (pass args after the endpoint function)
 *   await apiFetch(endpoints.products.detail, [id]);
 *
 * Version: increment API_VERSION whenever the endpoint contract changes.
 */

export const API_VERSION = "1.1.0";

export const API_BASE = (
  import.meta.env.VITE_API_URL || "https://api.thedesignhive.tech"
).replace(/\/$/, "");

/**
 * An endpoint is either a static path string or a function that returns a path
 * string (for parameterized routes).
 */
export type Endpoint = string | ((...args: any[]) => string);

/**
 * Resolves an endpoint reference into a concrete path string.
 * - If `endpoint` is a function, it is called with the provided `args`.
 * - Validates that the result is a non-empty string starting with "/".
 * Throws a descriptive error otherwise so misconfigured endpoints surface early.
 */
export function resolveEndpoint(
  endpoint: Endpoint,
  args: any[] = []
): string {
  const resolved =
    typeof endpoint === "function" ? endpoint(...args) : endpoint;

  if (typeof resolved !== "string" || resolved.length === 0) {
    throw new Error(
      `[endpoints] Invalid endpoint resolved: ${String(resolved)}. ` +
        `Endpoints must be a non-empty string starting with "/".`
    );
  }

  if (!resolved.startsWith("/")) {
    throw new Error(
      `[endpoints] Endpoint must start with "/": "${resolved}".`
    );
  }

  return resolved;
}

export const endpoints = {
  /* ---------------- AUTH ---------------- */
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
    google: "/api/auth/google",
    profile: "/api/auth/profile",
    resetPassword: "/api/auth/reset-password",
  },

  /* ---------------- ADMIN ---------------- */
  admin: {
    login: "/api/admin/login",
    logout: "/api/admin/logout",
    dashboard: "/api/admin/dashboard",
    resetPassword: "/admin/reset-password",

    orders: "/admin/orders",
    orderItems: (id: string) => `/admin/orders/${id}/items`,
    orderStatus: (id: string) => `/admin/orders/${id}/status`,
    orderBreakdown: (id: string) => `/admin/orders/${id}/breakdown`,

    coupons: "/api/admin/coupons",
    coupon: (id: string) => `/api/admin/coupons/${id}`,
    couponToggle: (id: string) => `/api/admin/coupons/${id}/toggle`,

    users: "/api/admin/users",
    userToggleAdmin: (id: string) => `/api/admin/users/${id}/toggle-admin`,

    products: "/api/admin/products",
    product: (id: string) => `/api/admin/products/${id}`,
    productStatus: (id: string) => `/api/admin/products/${id}/status`,

    phoneCover: {
      brands: "/api/admin/phone-cover/brands",
      brand: (id: string) => `/api/admin/phone-cover/brands/${id}`,
      models: "/api/admin/phone-cover/models",
      model: (id: string) => `/api/admin/phone-cover/models/${id}`,
      coverTypes: "/api/admin/phone-cover/cover-types",
      coverType: (id: string) => `/api/admin/phone-cover/cover-types/${id}`,
      modelCoverTypes: (modelId: string) =>
        `/api/admin/phone-cover/models/${modelId}/cover-types`,
      catalogProducts: "/api/admin/phone-cover/products",
      catalogProduct: (productId: string) =>
        `/api/admin/phone-cover/products/${productId}`,
      productModels: (productId: string) =>
        `/api/admin/phone-cover/products/${productId}/models`,
      settings: "/api/admin/phone-cover/settings",
    },

    banners: "/api/admin/banners",
    banner: (id: string) => `/api/admin/banners/${id}`,
    bannerToggle: (id: string) => `/api/admin/banners/${id}/toggle`,
    bannerSettings: "/api/admin/banners/settings",
  },

  /* ---------------- PRODUCTS ---------------- */
  products: {
    list: "/api/products",
    detail: (id: string) => `/api/products/${id}`,
    reviews: (id: string) => `/api/products/${id}/reviews`,
  },

  /* ---------------- REVIEWS ---------------- */
  reviews: {
    helpful: (id: string) => `/api/reviews/${id}/helpful`,
  },

  /* ---------------- COUPONS ---------------- */
  coupons: {
    apply: "/api/coupons/apply",
    validate: (code: string) => `/coupons/validate/${code}`,
  },

  /* ---------------- ORDERS ---------------- */
  orders: {
    list: "/api/orders",
    detail: (id: string) => `/api/orders/${id}`,
    tracking: (id: string) => `/api/orders/${id}/tracking`,
    invoice: (id: string) => `/api/orders/${id}/invoice`,
    create: "/api/orders",
  },

  /* ---------------- CHECKOUT / PAYMENT ---------------- */
  checkout: {
    sendOtp: "/api/send-otp",
    verifyOtp: "/api/verify-otp",
    createRazorpayOrder: "/api/create-razorpay-order",
    verifyPayment: "/api/verify-payment",
    checkout: "/api/checkout",
  },

  /* ---------------- ADDRESSES ---------------- */
  addresses: {
    list: "/api/addresses",
    create: "/api/addresses",
    detail: (id: string) => `/api/addresses/${id}`,
    setDefault: (id: string) => `/api/addresses/${id}/default`,
  },

  /* ---------------- PHONE COVER EDITOR ---------------- */
  phoneCover: {
    catalog: "/api/phone-covers/catalog",
    brands: "/api/brands",
    models: (brandId: string) => `/api/models/${brandId}`,
    coverTypes: (modelId: string) => `/api/cover-types/${modelId}`,
  },

  /* ---------------- ADVERTISEMENT BANNERS ---------------- */
  banners: {
    list: "/api/banners",
    events: (id: string) => `/api/banners/${id}/events`,
  },

  /* ---------------- UPLOAD ---------------- */
  upload: "/api/upload",
} as const;
