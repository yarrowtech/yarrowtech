// backend/controllers/career.Controller.js
import Career from "../models/Career.js";
import { notifyRoles } from "../erp/utils/createNotification.js";
import sendEmail from "../erp/utils/sendEmail.js";

export const submitCareer = async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file ? JSON.stringify(req.file, null, 2) : "NO FILE");
    console.log("REQ.BODY:", req.body ? JSON.stringify(req.body, null, 2) : "NO BODY");

    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const { name, email, message } = req.body;

    const data = await Career.create({
      ...req.body,
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
          <h2 style="color:#ffcb05;margin-top:0;">Thank you, ${name || "there"}!</h2>
          <p>We've received your career application and our team will review it shortly.</p>
          <p style="color:#94a3b8;">Here's a summary of what you submitted:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:110px;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${name || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;font-weight:600;">${email}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${message}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Resume</td>
              <td style="padding:8px 0;">${req.file.originalname}</td>
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
    const hrEmail = process.env.SMTP_USER || process.env.FROM_EMAIL;
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
              <td style="padding:8px 0;font-weight:600;">${name || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Email</td>
              <td style="padding:8px 0;">${email || "—"}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
              <td style="padding:8px 0;">${message}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#94a3b8;">Resume</td>
              <td style="padding:8px 0;">${req.file.originalname}</td>
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
        `
      );
    }

    res.json({ message: "Career application submitted", data });
  } catch (err) {
    console.error("Career Submit Error:", JSON.stringify(err, null, 2));
    res.status(500).json({ message: err.message });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const career = await Career.findById(id);

    console.log("Download requested for:", id, "| resumeUrl:", career?.resumeUrl);

    if (!career?.resumeUrl) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Insert fl_attachment into the Cloudinary URL → forces Content-Disposition: attachment
    // e.g. .../upload/v123/... → .../upload/fl_attachment/v123/...
    const downloadUrl = career.resumeUrl.includes("/upload/")
      ? career.resumeUrl.replace("/upload/", "/upload/fl_attachment/")
      : career.resumeUrl;

    console.log("Download URL:", downloadUrl);

    res.json({ url: downloadUrl, filename: career.resumeName || "resume" });
  } catch (err) {
    console.error("Download Resume Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllCareerSubmissions = async (_req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: careers.length, careers });
  } catch (err) {
    console.error("Career Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch career applications" });
  }
};
