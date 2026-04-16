import ERPPayment from "../models/Payment.js";
import ERPProject from "../models/Project.js";
import sendEmail from "../utils/sendEmail.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";

/* ================= ADD PAYMENT ================= */
export const addPayment = async (req, res) => {
  try {
    const { projectId, amount, method } = req.body;

    const project = await ERPProject.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const invoiceNo = `INV-${Date.now()}`;

    const payment = await ERPPayment.create({
      project: project._id,
      clientEmail: project.clientEmail,
      amount,
      method,
      invoiceNo,
      status: "paid",
    });

    const invoicePath = generateInvoicePDF(payment, project);

    await sendEmail(
      project.clientEmail,
      `Invoice ${invoiceNo} | YarrowTech`,
      `Hello ${project.clientName},

Invoice No: ${invoiceNo}
Project: ${project.name}
Amount Paid: ₹${amount}
Payment Method: ${method}

Thank you,
YarrowTech Team`,
      [{ filename: `invoice-${invoiceNo}.pdf`, path: invoicePath }]
    );

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: "Payment failed" });
  }
};

/* ================= GET PAYMENTS BY PROJECT ================= */
export const getPaymentsByProject = async (req, res) => {
  try {
    const payments = await ERPPayment.find({
      project: req.params.projectId,
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
/* ================= UPDATE PAYMENT ================= */
export const updatePayment = async (req, res) => {
  try {
    const { amount, status } = req.body;

    if (amount == null || !status) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    const updated = await ERPPayment.findByIdAndUpdate(
      req.params.paymentId,
      { amount, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ UPDATE PAYMENT ERROR:", err);
    res.status(500).json({ message: "Failed to update payment" });
  }
};

