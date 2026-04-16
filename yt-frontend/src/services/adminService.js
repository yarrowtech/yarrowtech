import API from "./axiosInstance";

/* ===============================
   ADMIN DASHBOARD STATS
================================ */
export const getAdminStats = async () => {
  const res = await API.get("/erp/admin/stats");
  return res.data;
};

/* ===============================
   ALL PROJECTS (ADMIN)
================================ */
export const getAllProjects = async () => {
  const res = await API.get("/erp/projects");
  return res.data;
};

/* ===============================
   ALL ERP USERS (ADMIN)
================================ */
export const getERPUsers = async () => {
  const res = await API.get("/erp/admin/users");
  return res.data.users || [];
};

/* ===============================
   CREATE ERP USER (ADMIN)
================================ */
export const createERPUser = async (payload) => {
  const res = await API.post("/erp/admin/create-user", payload);
  return res.data;
};

/* ===============================
   TOGGLE USER STATUS (ADMIN)
================================ */
export const toggleUserStatus = async (userId) => {
  const res = await API.put(`/erp/admin/user/${userId}/toggle-status`);
  return res.data;
};

/* ===============================
   RESET USER PASSWORD (ADMIN)
================================ */
export const resetUserPassword = async (userId, password) => {
  const res = await API.put(`/erp/admin/user/${userId}/reset-password`, {
    password,
  });
  return res.data;
};

/* ===============================
   CONTACT FORM SUBMISSIONS
================================ */
export const getContacts = async () => {
  const res = await API.get("/contact/all");
  return res.data;
};

/* ===============================
   DEMO REQUESTS (CRM LEADS)
================================ */
export const getDemoRequests = async () => {
  const res = await API.get("/forms/demo");
  return res.data;
};

/* ===============================
   EXPORT CRM LEADS → EXCEL
================================ */
export const exportLeadsExcel = async () => {
  const res = await API.get("/erp/admin/leads/export/excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = "crm-leads.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* ===============================
   EXPORT CRM LEADS → PDF
================================ */
export const exportLeadsPDF = async () => {
  const res = await API.get("/erp/admin/leads/export/pdf", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = "crm-leads.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* ===============================
   LEAD TIMELINE / HISTORY
================================ */
export const getLeadTimeline = async (leadId) => {
  const res = await API.get(`/erp/admin/leads/${leadId}/timeline`);
  return res.data;
};

/* ===============================
   UPDATE ADMIN PROFILE  ✅ FIX
================================ */
export const updateAdminProfile = async (payload) => {
  const res = await API.put("/erp/admin/profile", payload);
  return res.data;
};

/* ===============================
   UPDATE PROJECT (ADMIN)
================================ */
export const updateProject = async (projectId, payload) => {
  const res = await API.put(`/erp/projects/${projectId}`, payload);
  return res.data;
};
