import API from "./axiosInstance";

export const getNotifications = (params = {}) =>
  API.get("/erp/notifications", { params }).then((r) => r.data);

export const getUnreadCount = () =>
  API.get("/erp/notifications/unread-count").then((r) => r.data);

export const markRead = (id) =>
  API.patch(`/erp/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  API.patch("/erp/notifications/read-all").then((r) => r.data);

export const sendNotification = (payload) =>
  API.post("/erp/notifications/send", payload).then((r) => r.data);
