import API from "./axiosInstance";

/* =====================================================
   TECH LEAD DASHBOARD STATS
===================================================== */
export const getTechLeadStats = async () => {
  const res = await API.get("/erp/techlead/stats");
  return res.data;
};

/* =====================================================
   GET ASSIGNED PROJECTS
===================================================== */
export const getAssignedProjects = async () => {
  const res = await API.get("/erp/techlead/assigned");
  return res.data?.projects || [];
};






export const getTechLeadProfile = async () => {
  const res = await API.get("/erp/techlead/profile");
  return res.data;
};

export const updateTechLeadProfile = async (payload) => {
  const res = await API.put("/erp/techlead/profile", payload);
  return res.data;
};