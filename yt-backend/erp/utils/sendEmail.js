// erp/utils/sendEmail.js
import nodemailer from "nodemailer";
import logger from "../../utils/logger.js";

/* Inbox that receives website form alerts (contact, demo, career). */
export const getTeamInbox = () =>
  process.env.NOTIFY_EMAIL || process.env.SMTP_USER || process.env.FROM_EMAIL || "";

/* Escape user-submitted text before putting it into email HTML. */
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);

// One pooled SMTP connection reused by every email.
let transporter;
const getTransporter = () => {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
  });
  return transporter;
};

export default async function sendEmail(to, subject, html, { replyTo } = {}) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn({ to, subject }, "Email skipped: SMTP not configured");
      return false;
    }

    await getTransporter().sendMail({
      from: `"YarrowTech" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
    });

    logger.info({ to, subject }, "Email sent");
    return true;
  } catch (err) {
    logger.error({ err, to, subject, code: err.code, response: err.response }, "Email send failed");
    return false;
  }
}
