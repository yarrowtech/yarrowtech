import Notification from "../models/Notification.js";
import ERPUser from "../models/User.js";
import logger from "../../utils/logger.js";

/* Notify every active ERP user that has one of the given roles */
export async function notifyRoles(roles, title, message, type, link = "") {
  try {
    const roleList = Array.isArray(roles) ? roles : [roles];
    const users = await ERPUser.find({ role: { $in: roleList }, status: "active" }).select("email role").lean();
    if (!users.length) return;
    const docs = users.map((u) => ({
      recipientEmail: u.email,
      recipientRole:  u.role,
      title,
      message,
      type,
      link,
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    logger.error({ err: err }, "createNotification.notifyRoles error");
  }
}

/* Notify a single user by their email */
export async function notifyEmail(recipientEmail, recipientRole, title, message, type, link = "") {
  try {
    await Notification.create({ recipientEmail: recipientEmail.toLowerCase(), recipientRole, title, message, type, link });
  } catch (err) {
    logger.error({ err: err }, "createNotification.notifyEmail error");
  }
}
