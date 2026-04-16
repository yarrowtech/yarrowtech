// erp/utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendEmail(to, subject, text) {
  try {
    if (!process.env.SMTP_USER) {
      console.log("📨 Email skipped (SMTP not set):", { to, subject, text });
      return;
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.log("❌ Email Error:", err.message);
  }
}
