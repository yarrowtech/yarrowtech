import axios from "axios";

/*
|--------------------------------------------------------------------------
| ERP AXIOS INSTANCE
|--------------------------------------------------------------------------
| Rules:
| 1. Base URL must NOT include /api
| 2. NEVER attach token to ERP login routes
| 3. Use ONLY erp_token
|--------------------------------------------------------------------------
*/

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
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

      // Redirect to ERP login
      window.location.href = "/erp/login";
    }

    return Promise.reject(error);
  }
);

export default API;
