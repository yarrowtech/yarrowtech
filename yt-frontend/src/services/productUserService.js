import API from "./axiosInstance";

export const productUserService = {
  dashboard: async () => {
    const res = await API.get("/erp/product-user/dashboard");
    return res.data;
  },

  project: async () => {
    const res = await API.get("/erp/product-user/project");
    return res.data;
  },

  payments: async () => {
    const res = await API.get("/erp/product-user/payments");
    return res.data;
  },
};
