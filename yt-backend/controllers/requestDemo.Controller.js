





import RequestDemo from "../models/RequestDemo.js";
import { notifyRoles } from "../erp/utils/createNotification.js";
import sendEmail from "../erp/utils/sendEmail.js";

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

    // ── Email 1: Confirmation to requester ──────────────────────
    if (email) {
      sendEmail(
        email,
        "We've received your demo request — YarrowTech",
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#071a2d;color:#f1f5f9;border-radius:14px;padding:32px;">
          <h2 style="color:#ffcb05;margin-top:0;">Thank you, ${name}!</h2>
          <p>We've received your demo request and our team will get back to you shortly.</p>
          <p style="color:#94a3b8;">Here's what you submitted:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:130px;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;font-weight:600;">${email}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Company</td>
              <td style="padding:8px 0;">${company}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${message}</td>
            </tr>
          </table>
          <p>Our team will reach out within 1–2 business days to schedule your demo.</p>
          <p style="margin-top:28px;color:#64748b;font-size:0.85rem;">
            — Team YarrowTech<br/>
            <a href="https://yarrowtech.co.in" style="color:#ffcb05;">yarrowtech.co.in</a>
          </p>
        </div>
        `
      );
    }

    // ── Email 2: Alert to YarrowTech team ───────────────────────
    const hrEmail = process.env.SMTP_USER || process.env.FROM_EMAIL;
    if (hrEmail) {
      sendEmail(
        hrEmail,
        `New Demo Request — ${name}${company ? ` (${company})` : ""}`,
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#071a2d;color:#f1f5f9;border-radius:14px;padding:32px;">
          <h2 style="color:#ffcb05;margin-top:0;">New Demo Request</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:130px;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;">${email}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Company</td>
              <td style="padding:8px 0;">${company}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${message}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Submitted</td>
              <td style="padding:8px 0;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>
          <p style="margin-top:24px;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/manager/requests"
               style="display:inline-block;padding:11px 22px;border-radius:999px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">
              View in Admin Panel
            </a>
          </p>
        </div>
        `
      );
    }

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
