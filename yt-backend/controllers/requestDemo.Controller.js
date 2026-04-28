





import RequestDemo from "../models/RequestDemo.js";
import { notifyRoles } from "../erp/utils/createNotification.js";

/* ============================================================
   🌐 SUBMIT REQUEST DEMO (Website User)
============================================================ */
export const submitRequestDemo = async (req, res) => {
  try {
    console.log("📥 Incoming Body:", req.body);

    const name = (req.body.name || req.body.fullName || "").trim();
    const email = (req.body.email || "").trim();
    const company = (req.body.company || req.body.companyName || "").trim();
    const message = (
      req.body.message || req.body.projectDescription || ""
    ).trim();

    // ✅ Email validation
    const isValidEmail = /\S+@\S+\.\S+/.test(email);

    // ✅ Required validation
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const demoRequest = await RequestDemo.create({
      fullName: name,
      email,
      companyName: company,
      projectDescription: message,
      serviceInterested: "Demo Request",
      preferredContactMethod: "email",
    });

    notifyRoles(
      ["admin", "manager"],
      "New Demo Request",
      `${name}${company ? ` from ${company}` : ""} submitted a demo request.`,
      "demo_request",
      "/manager/requests"
    );

    return res.status(201).json({
      success: true,
      message: "Demo request submitted successfully",
      data: demoRequest,
    });
  } catch (error) {
    console.error("❌ REQUEST DEMO ERROR:", error);

    return res.status(500).json({
      message: "Server error while submitting demo request",
    });
  }
};

/* ============================================================
   👑 ADMIN → VIEW ALL DEMO REQUESTS (READ ONLY)
============================================================ */
export const getAllDemoRequests = async (req, res) => {
  try {
    const requests = await RequestDemo.find()
      .populate("assignedManager", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("❌ FETCH DEMO REQUESTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch demo requests",
    });
  }
};

/* ============================================================
   🧑‍💼 MANAGER → VIEW DEMO REQUESTS
============================================================ */
export const getManagerDemoRequests = async (req, res) => {
  try {
    const requests = await RequestDemo.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("❌ MANAGER FETCH DEMO ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch demo requests",
    });
  }
};

/* ============================================================
   🧑‍💼 MANAGER → UPDATE LEAD STATUS ONLY
============================================================ */
export const updateLeadStatusByManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "contacted",
      "in-progress",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid lead status",
      });
    }

    const updatedLead = await RequestDemo.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead status updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("❌ UPDATE LEAD STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update lead status",
    });
  }
};
