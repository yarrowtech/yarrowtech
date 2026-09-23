// erp/utils/sendEmail.js
import nodemailer from "nodemailer";
import logger from "../../utils/logger.js";

export default async function sendEmail(to, subject, html) {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn({ to, subject }, "Email skipped: SMTP not configured");
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

    logger.info({ to }, "Email sent");
  } catch (err) {
    logger.error({ err, code: err.code, response: err.response }, "Email send failed");
  }
}
