import express from "express";
import { submitContact, getAllContacts } from "../controllers/contact.Controller.js";
import { authMiddleware } from "../middleware/auth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

// User submits contact form  
router.post("/", submitContact);

// Admin and manager fetch all contacts
router.get("/all", authMiddleware, verifyRoles("admin", "manager"), getAllContacts);

export default router;
