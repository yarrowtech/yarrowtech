// backend/controllers/career.Controller.js
import Career from "../models/Career.js";
import { notifyRoles } from "../erp/utils/createNotification.js";
import sendEmail, { escapeHtml, getTeamInbox } from "../erp/utils/sendEmail.js";
import cloudinary from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const submitCareer = async (req, res) => {
  try {
    logger.debug({ file: req.file?.originalname, body: req.body }, "Career submission");

    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safeFileName = escapeHtml(req.file.originalname);

    const data = await Career.create({
      name,
      email,
      message: message || "",
      resumeUrl:      req.file.path,
      resumeName:     req.file.originalname,
      resumePublicId: req.file.filename,
    });

    notifyRoles(
      ["admin", "manager"],
      "New Career Application",
      `${name || "Someone"} submitted a career application${email ? ` (${email})` : ""}.`,
      "career_application",
      "/manager/careers"
    );

    // ── Email 1: Confirmation to applicant ──────────────────────
    if (email) {
      sendEmail(
        email,
        "We've received your application — YarrowTech",
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#071a2d;color:#f1f5f9;border-radius:14px;padding:32px;">
          <h2 style="color:#ffcb05;margin-top:0;">Thank you, ${safeName || "there"}!</h2>
          <p>We've received your career application and our team will review it shortly.</p>
          <p style="color:#94a3b8;">Here's a summary of what you submitted:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:110px;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${safeName || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;font-weight:600;">${safeEmail}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${safeMessage}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Resume</td>
              <td style="padding:8px 0;">${safeFileName}</td>
            </tr>
          </table>
          <p>We'll be in touch if your profile matches our current openings.</p>
          <p style="margin-top:28px;color:#64748b;font-size:0.85rem;">
            — Team YarrowTech<br/>
            <a href="https://yarrowtech.co.in" style="color:#ffcb05;">yarrowtech.co.in</a>
          </p>
        </div>
        `
      );
    }

    // ── Email 2: Alert to YarrowTech team ───────────────────────
    const hrEmail = getTeamInbox();
    if (hrEmail) {
      sendEmail(
        hrEmail,
        `New Career Application — ${name || "Unknown"} (${email || "no email"})`,
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#071a2d;color:#f1f5f9;border-radius:14px;padding:32px;">
          <h2 style="color:#ffcb05;margin-top:0;">New Career Application</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:110px;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${safeName || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;">${safeEmail || "—"}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${safeMessage}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Resume</td>
              <td style="padding:8px 0;">${safeFileName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Submitted</td>
              <td style="padding:8px 0;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>
          <p style="margin-top:24px;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/careers"
               style="display:inline-block;padding:11px 22px;border-radius:999px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">
              View in Admin Panel
            </a>
          </p>
        </div>
        `,
        { replyTo: email }
      );
    }

    res.json({ message: "Career application submitted", data });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    logger.error({ err }, "Career submit error");
    res.status(500).json({ message: "Could not submit your application. Please try again." });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const career = await Career.findById(id);

    if (!career?.resumeUrl) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const filename = career.resumeName || "resume";
    const ext = filename.split(".").pop().toLowerCase();
    const mimeMap = {
      pdf:  "application/pdf",
      doc:  "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    // Resolve public_id — stored field or extracted from URL
    let publicId = career.resumePublicId || "";
    if (!publicId && career.resumeUrl) {
      const match = career.resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (match) publicId = match[1];
    }

    // private_download_url generates a signed API URL that works for
    // both public and authenticated Cloudinary resources
    let fetchUrl = career.resumeUrl;
    if (publicId) {
      fetchUrl = cloudinary.utils.private_download_url(publicId, ext, {
        resource_type: "raw",
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
    }

    const fileRes = await fetch(fetchUrl);

    if (!fileRes.ok) {
      logger.error({ status: fileRes.status, publicId }, "Cloudinary fetch failed");
      return res.status(502).json({ message: "Failed to fetch resume from storage" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");

    const arrayBuffer = await fileRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    logger.error({ err: err }, "Download Resume Error");
    res.status(500).json({ message: err.message });
  }
};

export const getAllCareerSubmissions = async (_req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: careers.length, careers });
  } catch (err) {
    logger.error({ err: err }, "Career Fetch Error");
    return res.status(500).json({ success: false, message: "Failed to fetch career applications" });
  }
};
