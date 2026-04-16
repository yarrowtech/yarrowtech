import API from "./axiosInstance";

/* =====================================================
   CLIENT SERVICE – ERP VERSION
===================================================== */
export const clientService = {
  /* ================= DASHBOARD ================= */
  dashboard: async () => {
    const res = await API.get("/erp/client/dashboard");
    return res.data;
  },

  /* ================= PROJECTS ================= */
  projects: async () => {
    const res = await API.get("/erp/client/projects");
    return res.data;
  },

  /* ================= PAYMENTS ================= */
  payments: async () => {
    const res = await API.get("/erp/client/payments");
    return res.data;
  },

  /* ================= PROJECT HISTORY ================= */
  history: async () => {
    const res = await API.get("/erp/client/project-history");
    return res.data;
  },

  /* ================= PROFILE ================= */
  profile: async () => {
    const res = await API.get("/erp/client/profile");
    return res.data;
  },

  /* ================= UPDATE PROFILE ================= */
  updateProfile: async (data) => {
    const res = await API.put("/erp/client/profile", data);
    return res.data;
  },
};
