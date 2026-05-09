// erp/utils/sendEmail.js
import nodemailer from "nodemailer";

export default async function sendEmail(to, subject, html) {
  try {
    if (!process.env.SMTP_USER) {
      console.log("📨 Email skipped (SMTP not set):", { to, subject });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"YarrowTech" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email Error:", err.message, "| code:", err.code, "| response:", err.response);
  }
}
