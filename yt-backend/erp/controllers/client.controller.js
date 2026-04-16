// erp/controllers/client.controller.js
import ERPProject from "../models/Project.js";
import ERPPayment from "../models/Payment.js";
import ERPMessage from "../models/Message.js";

export const getMyProjects = async (req, res) => {
  const projects = await ERPProject.find({ client: req.erpUser.id });
  res.json({ success: true, projects });
};

export const getPaymentsForProject = async (req, res) => {
  const payments = await ERPPayment.find({ project: req.params.projectId });
  res.json({ success: true, payments });
};

export const sendMessage = async (req, res) => {
  const { toEmail, text } = req.body;

  const message = await ERPMessage.create({
    project: req.params.projectId,
    fromEmail: req.erpUser.email,
    toEmail,
    text,
  });

  res.json({ success: true, message });
};
