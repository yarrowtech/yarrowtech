import axios from "axios";

/*
|--------------------------------------------------------------------------
| BASE CONFIG
|--------------------------------------------------------------------------
| Normalizes VITE_API_URL so a misconfigured env var (missing "/api", or
| a trailing slash) doesn't silently 404 every request — this exact
| mistake happened in production (VITE_API_URL set to the bare domain).
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
| REQUEST INTERCEPTOR (SAFE)
|--------------------------------------------------------------------------
| Rules:
| 1. NEVER attach ERP token to:
|    - Website auth routes
|    - ERP login route
| 2. Attach ERP token ONLY to protected ERP routes
|--------------------------------------------------------------------------
*/
API.interceptors.request.use(
  (config) => {
    const skipAuth =
      config.url.includes("/api/auth/login") ||
      config.url.includes("/api/auth/register") ||
      config.url.includes("/api/auth/google") ||
      config.url.includes("/api/erp/auth/login");

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
      console.warn("🔐 ERP session expired or unauthorized");

      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_user");

      // Website login modal lives on home page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;
