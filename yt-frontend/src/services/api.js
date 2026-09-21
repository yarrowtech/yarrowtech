import axios from "axios";

/*
|--------------------------------------------------------------------------
| ERP AXIOS INSTANCE
|--------------------------------------------------------------------------
| Rules:
| 1. Base URL MUST include /api — every call below omits the /api prefix
|    on its own path (e.g. API.get("/efnbmms/plans")), so it has to come
|    from here. VITE_API_URL is normalized below in case it's ever set to
|    the bare domain (this happened in production and caused silent 404s).
| 2. NEVER attach token to ERP login routes
| 3. Use ONLY erp_token
|--------------------------------------------------------------------------
*/
const normalizeApiBase = (url) => {
  const trimmed = String(url || "").replace(/\/+$/, "");
  if (!trimmed) return "http://localhost:5000/api";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const API = axios.create({
  baseURL: normalizeApiBase(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/
API.interceptors.request.use(
  (config) => {
    const skipAuth =
      config.url.includes("/api/erp/auth/login") ||
      config.url.includes("/api/auth/login") ||
      config.url.includes("/api/auth/register") ||
      config.url.includes("/api/auth/google");

    if (!skipAuth) {
      const token = localStorage.getItem("erp_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔐 ERP Unauthorized / Session expired");

      // Clear ERP auth data
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_user");

      // Redirect to the site's login (header login modal)
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;
