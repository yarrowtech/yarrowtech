import express from "express";
import { submitContact, getAllContacts } from "../controllers/contact.Controller.js";

const router = express.Router();

// User submits contact form  
router.post("/", submitContact);

// Admin fetches all contacts  
router.get("/all", getAllContacts);

export default router;
