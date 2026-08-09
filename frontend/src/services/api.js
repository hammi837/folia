import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("folia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("folia_token");
      // Clear Redux auth without creating a circular import at module load
      import("../store")
        .then(({ store }) => import("../store/slices/authSlice").then(({ clearAuth }) => {
          store.dispatch(clearAuth());
        }))
        .catch(() => {});
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        const from = window.location.pathname;
        window.location.assign(`/login?next=${encodeURIComponent(from)}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
