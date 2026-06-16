// src/lib/api.ts

const BASE_URL = "https://api.thedesignhive.tech";

interface ApiOptions extends RequestInit {
  token?: string;
}

export const apiFetch = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const token = localStorage.getItem("token"); // JWT from login

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json();
};

/* ================= AUTH HELPERS ================= */

export const apiAuth = {
  login: (email: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch("/auth/me"),

  logout: () => {
    localStorage.removeItem("token");
  },
};

/* ================= ADMIN HELPERS ================= */

export const apiAdmin = {
  getOrders: () => apiFetch("/admin/orders"),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getCoupons: () => apiFetch("/admin/coupons"),
  createCoupon: (data: any) =>
    apiFetch("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCoupon: (id: string, data: any) =>
    apiFetch(`/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: string) =>
    apiFetch(`/admin/coupons/${id}`, { method: "DELETE" }),

  getUsers: () => apiFetch("/admin/users"),
  toggleAdmin: (userId: string) =>
    apiFetch(`/admin/users/${userId}/toggle-admin`, {
      method: "PATCH",
    }),
};

/* ================= SHOP HELPERS ================= */

export const apiShop = {
  getProducts: () => apiFetch("/products"),
  getProduct: (id: string) => apiFetch(`/products/${id}`),

  applyCoupon: (code: string, subtotal: number) =>
    apiFetch("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    }),

  createOrder: (data: any) =>
    apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
