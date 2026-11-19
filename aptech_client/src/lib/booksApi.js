// Thin client for the bookstore API (/api/books). All helpers return the `data`
// field or throw an Error with the server's message.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001") + "/api";

const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

async function request(method, path, body, { auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  const t = auth ? token() : null;
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API_BASE}/books${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data;
}

export const booksApi = {
  // public
  list: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request("GET", q ? `?${q}` : "", null, { auth: false });
  },
  get: (slug) => request("GET", `/${encodeURIComponent(slug)}`, null, { auth: false }),

  // student (login required)
  content: (slug) => request("GET", `/${encodeURIComponent(slug)}/content`),
  myStatus: (slug) => request("GET", `/${encodeURIComponent(slug)}/my-status`),
  claimFree: (slug) => request("POST", `/${encodeURIComponent(slug)}/claim-free`),
  order: (payload) => request("POST", "/orders", payload),
  myOrders: () => request("GET", "/my/orders"),
  myLibrary: () => request("GET", "/my/library"),

  // admin
  adminList: () => request("GET", "/admin/all"),
  adminGet: (id) => request("GET", `/admin/${encodeURIComponent(id)}`),
  adminStats: () => request("GET", "/admin/stats"),
  create: (payload) => request("POST", "", payload),
  update: (id, payload) => request("PATCH", `/${encodeURIComponent(id)}`, payload),
  remove: (id) => request("DELETE", `/${encodeURIComponent(id)}`),
  adminOrders: (status) => request("GET", `/admin/orders${status ? `?status=${status}` : ""}`),
  approveOrder: (orderId) => request("PATCH", `/admin/orders/${orderId}/approve`),
  cancelOrder: (orderId) => request("PATCH", `/admin/orders/${orderId}/cancel`),
  setDelivery: (orderId, deliveryStatus) => request("PATCH", `/admin/orders/${orderId}/delivery`, { deliveryStatus }),
  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("POST", "/admin/upload", fd, { isForm: true });
  },
};

export const formatTaka = (n) => `৳${Number(n || 0).toLocaleString("en-IN")}`;

export const isLoggedIn = () => !!token();

export const FORMAT_LABEL = {
  printed: { en: "Printed book", bn: "ছাপা বই" },
  digital: { en: "Digital (PDF)", bn: "ডিজিটাল (PDF)" },
  both: { en: "Printed + Digital", bn: "ছাপা + ডিজিটাল" },
};
