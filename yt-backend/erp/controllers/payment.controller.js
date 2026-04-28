import ERPPayment from "../models/Payment.js";
import ERPProject from "../models/Project.js";
import sendEmail from "../utils/sendEmail.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { calculateProjectPaymentSummary } from "../utils/paymentSummary.js";
import { notifyEmail } from "../utils/createNotification.js";

const VALID_PAYMENT_STATUSES = ["paid", "pending", "failed"];

const sanitizeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const sanitizeStatus = (value, fallback = "paid") => {
  const status = String(value || fallback).toLowerCase();
  return VALID_PAYMENT_STATUSES.includes(status) ? status : fallback;
};

const normalizePayment = (payment) => ({
  _id: payment._id,
  project: payment.project,
  clientEmail: payment.clientEmail,
  amount: Number(payment.amount) || 0,
  method: payment.method || "",
  paymentType: payment.paymentType || "project-payment",
  invoiceNo: payment.invoiceNo || "",
  status: sanitizeStatus(payment.status),
  paymentDate: payment.paymentDate || payment.createdAt,
  notes: payment.notes || "",
  createdAt: payment.createdAt,
});

async function findProjectForUser(projectId, erpUser) {
  const query = { _id: projectId };
  const userId = erpUser?._id || erpUser?.id;
  const role = erpUser?.role;

  if (role === "manager") {
    query.manager = userId;
  }

  if (role === "client") {
    query.client = userId;
  }

  return ERPProject.findOne(query)
    .populate("client", "name email status clientId phone company")
    .lean();
}

async function buildProjectPaymentPayload(projectId, erpUser) {
  const project = await findProjectForUser(projectId, erpUser);

  if (!project) {
    return null;
  }

  const paymentDocs = await ERPPayment.find({ project: project._id })
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();

  const payments = paymentDocs.map(normalizePayment);

  return {
    project: {
      _id: project._id,
      projectId: project.projectId,
      name: project.name,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      totalPayment: Number(project.totalPayment) || 0,
    },
    summary: calculateProjectPaymentSummary(project, payments),
    payments,
  };
}

export const updateProjectPaymentSummary = async (req, res) => {
  try {
    const project = await findProjectForUser(req.params.projectId, req.erpUser);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalPayment = sanitizeAmount(req.body?.totalPayment);
    if (totalPayment == null) {
      return res.status(400).json({ message: "Valid total payment is required" });
    }

    await ERPProject.findByIdAndUpdate(project._id, { totalPayment });
    const payload = await buildProjectPaymentPayload(project._id, req.erpUser);

    res.json({
      success: true,
      message: "Project payment summary updated successfully",
      ...payload,
    });
  } catch (err) {
    console.error("PAYMENT SUMMARY UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update project payment summary" });
  }
};

export const addPayment = async (req, res) => {
  try {
    const {
      projectId,
      amount,
      method,
      paymentType,
      paymentDate,
      notes,
      status,
    } = req.body || {};

    const project = await findProjectForUser(projectId, req.erpUser);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const sanitizedAmount = sanitizeAmount(amount);
    if (sanitizedAmount == null) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    if (!String(method || "").trim()) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const invoiceNo = `INV-${Date.now()}`;
    const normalizedStatus = sanitizeStatus(status);

    const payment = await ERPPayment.create({
      project: project._id,
      clientEmail: project.clientEmail,
      amount: sanitizedAmount,
      method: String(method).trim(),
      paymentType: String(paymentType || "project-payment").trim(),
      paymentDate: paymentDate || new Date(),
      notes: String(notes || "").trim(),
      invoiceNo,
      status: normalizedStatus,
    });

    if (normalizedStatus === "paid") {
      try {
        const invoicePath = generateInvoicePDF(payment, project);

        await sendEmail(
          project.clientEmail,
          `Invoice ${invoiceNo} | YarrowTech`,
          `Hello ${project.clientName},

Invoice No: ${invoiceNo}
Project: ${project.name}
Amount Paid: Rs ${sanitizedAmount}
Payment Method: ${method}
Payment Type: ${paymentType || "project-payment"}

Thank you,
YarrowTech Team`,
          [{ filename: `invoice-${invoiceNo}.pdf`, path: invoicePath }]
        );
      } catch (emailErr) {
        console.error("PAYMENT EMAIL ERROR:", emailErr.message);
      }
    }

    const payload = await buildProjectPaymentPayload(project._id, req.erpUser);

    notifyEmail(
      project.clientEmail, "client",
      `Payment Recorded: ₹${sanitizedAmount}`,
      `A ${normalizedStatus} payment of ₹${sanitizedAmount} (${paymentType || "Project Payment"}) has been recorded for project "${project.name}". Invoice: ${invoiceNo}.`,
      "payment_added",
      "/client/payments"
    );

    res.json({
      success: true,
      message: "Payment added successfully",
      payment: normalizePayment(payment.toObject()),
      ...payload,
    });
  } catch (err) {
    console.error("ADD PAYMENT ERROR:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};

export const getPaymentsByProject = async (req, res) => {
  try {
    const payload = await buildProjectPaymentPayload(
      req.params.projectId,
      req.erpUser
    );

    if (!payload) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      success: true,
      ...payload,
    });
  } catch (err) {
    console.error("GET PROJECT PAYMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await ERPPayment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const project = await findProjectForUser(payment.project, req.erpUser);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updates = {};

    if (req.body?.amount !== undefined) {
      const sanitizedAmount = sanitizeAmount(req.body.amount);
      if (sanitizedAmount == null) {
        return res.status(400).json({ message: "Valid payment amount is required" });
      }
      updates.amount = sanitizedAmount;
    }

    if (req.body?.status !== undefined) {
      updates.status = sanitizeStatus(req.body.status);
    }

    if (req.body?.method !== undefined) {
      const method = String(req.body.method || "").trim();
      if (!method) {
        return res.status(400).json({ message: "Payment method is required" });
      }
      updates.method = method;
    }

    if (req.body?.paymentType !== undefined) {
      updates.paymentType = String(req.body.paymentType || "").trim();
    }

    if (req.body?.paymentDate !== undefined) {
      updates.paymentDate = req.body.paymentDate;
    }

    if (req.body?.notes !== undefined) {
      updates.notes = String(req.body.notes || "").trim();
    }

    const updated = await ERPPayment.findByIdAndUpdate(
      req.params.paymentId,
      updates,
      { new: true }
    );

    const payload = await buildProjectPaymentPayload(project._id, req.erpUser);

    res.json({
      success: true,
      message: "Payment updated successfully",
      payment: normalizePayment(updated.toObject()),
      ...payload,
    });
  } catch (err) {
    console.error("UPDATE PAYMENT ERROR:", err);
    res.status(500).json({ message: "Failed to update payment" });
  }
};
