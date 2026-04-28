import Notification from "../models/Notification.js";
import ERPUser from "../models/User.js";
import ERPClient from "../models/Client.js";

const recipientEmail = (req) => String(req.erpUser?.email || "").toLowerCase();

/* GET /api/erp/notifications — paginated, newest first */
export const getNotifications = async (req, res) => {
  try {
    const email = recipientEmail(req);
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { recipientEmail: email };
    if (req.query.unread === "true") filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, notifications, total, page, limit });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* GET /api/erp/notifications/unread-count */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipientEmail: recipientEmail(req), isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

/* PATCH /api/erp/notifications/:id/read */
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientEmail: recipientEmail(req) },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/* PATCH /api/erp/notifications/read-all */
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientEmail: recipientEmail(req), isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

/* POST /api/erp/notifications/send  (admin + manager only)
   body: { targetType: "role"|"email", target: "manager"|"client"|...|"user@x.com", title, message, link }
*/
export const sendNotification = async (req, res) => {
  try {
    const { targetType, target, title, message = "", link = "" } = req.body || {};

    if (!targetType || !target || !title) {
      return res.status(400).json({ message: "targetType, target and title are required" });
    }

    const docs = [];

    if (targetType === "role") {
      /* Notify all active ERP users with this role */
      const erpUsers = await ERPUser.find({ role: target, status: "active" }).select("email role").lean();
      erpUsers.forEach((u) => docs.push({ recipientEmail: u.email, recipientRole: u.role, title, message, link }));

      /* If role is "client", also search ERPClient */
      if (target === "client") {
        const clients = await ERPClient.find({ status: "active" }).select("email").lean();
        clients.forEach((c) => docs.push({ recipientEmail: c.email, recipientRole: "client", title, message, link }));
      }
    } else if (targetType === "email") {
      /* Notify a specific user by email — detect role */
      const email = String(target).toLowerCase();
      const erpUser = await ERPUser.findOne({ email }).select("role").lean();
      const role    = erpUser?.role || "client";
      docs.push({ recipientEmail: email, recipientRole: role, title, message, link });
    } else {
      return res.status(400).json({ message: "targetType must be 'role' or 'email'" });
    }

    if (!docs.length) {
      return res.status(404).json({ message: "No recipients found for the given target" });
    }

    await Notification.insertMany(docs);
    res.json({ success: true, sent: docs.length });
  } catch (err) {
    console.error("SEND NOTIFICATION ERROR:", err);
    res.status(500).json({ message: "Failed to send notification" });
  }
};
