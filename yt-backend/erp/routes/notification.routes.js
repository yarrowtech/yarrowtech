import express from "express";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  sendNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/",              verifyErpToken, getNotifications);
router.get("/unread-count",  verifyErpToken, getUnreadCount);
router.patch("/read-all",    verifyErpToken, markAllRead);
router.patch("/:id/read",    verifyErpToken, markRead);
router.post("/send",         verifyErpToken, verifyRoles("admin", "manager"), sendNotification);

export default router;
