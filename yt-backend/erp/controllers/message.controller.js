// erp/controllers/message.controller.js
import ERPMessage from "../models/Message.js";
import ERPProject from "../models/Project.js";

/* ===============================================
   GET MESSAGES FOR A PROJECT
================================================ */
export const byProject = async (req, res) => {
  try {
    const messages = await ERPMessage.find({
      project: req.params.projectId
    }).sort("createdAt");

    res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ MESSAGE FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/* ===============================================
   SEND MESSAGE (Manager / Client / TechLead)
================================================ */
export const sendMessage = async (req, res) => {
  try {
    const { projectId, text, toEmail } = req.body;

    if (!text || !projectId || !toEmail) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newMsg = await ERPMessage.create({
      project: projectId,
      fromEmail: req.erpUser.email,   // logged-in ERP user
      toEmail,
      text
    });

    res.json({ success: true, message: newMsg });
  } catch (err) {
    console.error("❌ SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
