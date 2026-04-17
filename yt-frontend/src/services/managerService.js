import API from "./axiosInstance";

/* =====================================================
   MANAGER → CREATE CLIENT + PROJECT
===================================================== */
export const createClientAndProject = async (payload) => {
  const res = await API.post("/erp/manager/create-project", payload);
  return res.data;
};

/* =====================================================
   MANAGER → PROJECTS
===================================================== */

/**
 * Get all projects assigned to logged-in manager
 */
export const getManagerProjects = async () => {
  const res = await API.get("/erp/manager/projects");
  return Array.isArray(res.data?.projects) ? res.data.projects : [];
};

/**
 * Update project (status, progress, expectedDelivery)
 */
export const updateManagerProject = async (projectId, payload) => {
  const res = await API.put(`/erp/manager/projects/${projectId}`, payload);
  return res.data;
};

/**
 * Delete project (optional delete client)
 */
export const deleteManagerProject = async (
  projectId,
  deleteClient = false
) => {
  const res = await API.delete(
    `/erp/manager/projects/${projectId}?deleteClient=${deleteClient}`
  );
  return res.data;
};

/* =====================================================
   🔥 NEW → CLIENT MANAGEMENT (ADDED ONLY)
===================================================== */

/**
 * Delete client
 */
export const deleteClient = async (clientId) => {
  const res = await API.delete(`/erp/manager/client/${clientId}`);
  return res.data;
};

export const getDeletedClientHistory = async () => {
  const res = await API.get("/erp/manager/client-history");
  return Array.isArray(res.data?.history) ? res.data.history : [];
};

/**
 * Reset client password
 */
export const resetClientPassword = async (clientId, password) => {
  const res = await API.put(
    `/erp/manager/client/reset-password/${clientId}`,
    { password }
  );
  return res.data;
};

/* =====================================================
   MANAGER → TECH LEADS
===================================================== */

/**
 * Get active tech leads
 */
export const getTechLeads = async () => {
  const res = await API.get("/erp/manager/techleads");

  const list =
    res.data?.techLeads ||
    res.data?.users ||
    [];

  return Array.isArray(list) ? list : [];
};

/* =====================================================
   MANAGER → CRM DEMO REQUESTS
===================================================== */

/**
 * Get all demo requests (CRM leads)
 */
export const getManagerDemoRequests = async () => {
  const res = await API.get("/forms/manager/demo");
  return Array.isArray(res.data?.requests) ? res.data.requests : [];
};

/**
 * Update demo request status
 */
export const updateManagerLeadStatus = async (leadId, status) => {
  const res = await API.put(
    `/forms/manager/demo/${leadId}/status`,
    { status }
  );
  return res.data;
};

/* =====================================================
   MANAGER → PAYMENTS
===================================================== */

/**
 * Get payments for a project
 */
export const getProjectPayments = async (projectId) => {
  if (!projectId) return { project: null, summary: null, payments: [] };
  const res = await API.get(`/erp/payments/project/${projectId}`);
  return res.data || { project: null, summary: null, payments: [] };
};

/**
 * Add payment
 */
export const addProjectPayment = async (payload) => {
  const res = await API.post("/erp/payments", payload);
  return res.data;
};

/**
 * Update project payment summary
 */
export const updateProjectPaymentSummary = async (projectId, payload) => {
  const res = await API.put(`/erp/payments/project/${projectId}/summary`, payload);
  return res.data;
};

/**
 * Update payment
 */
export const updateProjectPayment = async (paymentId, payload) => {
  const res = await API.put(`/erp/payments/${paymentId}`, payload);
  return res.data;
};
