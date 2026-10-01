// // erp/utils/sendEmail.js
// import nodemailer from "nodemailer";
// import logger from "../../utils/logger.js";

// /* Inbox that receives website form alerts (contact, demo, career). */
// export const getTeamInbox = () =>
//   process.env.NOTIFY_EMAIL || process.env.SMTP_USER || process.env.FROM_EMAIL || "";

// /* Escape user-submitted text before putting it into email HTML. */
// export const escapeHtml = (value) =>
//   String(value ?? "").replace(/[&<>"']/g, (ch) => ({
//     "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
//   })[ch]);

// // One pooled SMTP connection reused by every email.
// let transporter;
// const getTransporter = () => {
//   transporter ??= nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: false,
//     requireTLS: true,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//     pool: true,
//   });
//   return transporter;
// };

// export default async function sendEmail(to, subject, html, { replyTo } = {}) {
//   try {
//     if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//       logger.warn({ to, subject }, "Email skipped: SMTP not configured");
//       return false;
//     }

//     await getTransporter().sendMail({
//       from: `"YarrowTech" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
//       to,
//       subject,
//       html,
//       ...(replyTo && { replyTo }),
//     });

//     logger.info({ to, subject }, "Email sent");
//     return true;
//   } catch (err) {
//     logger.error({ err, to, subject, code: err.code, response: err.response }, "Email send failed");
//     return false;
//   }
// }











// erp/utils/sendEmail.js

import nodemailer from "nodemailer";
import logger from "../../utils/logger.js";

/* -------------------------------------------------------
   TEAM INBOX
   Receives website form alerts:
   - Contact
   - Demo
   - Career
------------------------------------------------------- */
export const getTeamInbox = () =>
  process.env.NOTIFY_EMAIL ||
  process.env.SMTP_USER ||
  process.env.FROM_EMAIL ||
  "";

/* -------------------------------------------------------
   ESCAPE HTML
   Protects user-submitted content before inserting it
   into email HTML.
------------------------------------------------------- */
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);

/* -------------------------------------------------------
   SMTP TRANSPORTER
------------------------------------------------------- */

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      // GoDaddy / Titan SMTP
      host:
        process.env.SMTP_HOST ||
        "smtpout.secureserver.net",

      // Port 465 = SSL
      port: Number(
        process.env.SMTP_PORT || 465
      ),

      // SSL enabled for port 465
      secure: true,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      // Reuse SMTP connections
      pool: true,

      // Optional connection limits
      maxConnections: 5,
      maxMessages: 100,

      // Connection timeout
      connectionTimeout: 15000,

      // Socket timeout
      socketTimeout: 30000,

      // Greeting timeout
      greetingTimeout: 15000,
    });
  }

  return transporter;
};

/* -------------------------------------------------------
   SEND EMAIL
------------------------------------------------------- */

export default async function sendEmail(
  to,
  subject,
  html,
  { replyTo } = {}
) {
  try {
    /* ---------------------------------------------------
       CHECK SMTP CONFIGURATION
    --------------------------------------------------- */

    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      logger.warn(
        {
          to,
          subject,
        },
        "Email skipped: SMTP credentials are not configured"
      );

      return false;
    }

    /* ---------------------------------------------------
       CHECK RECIPIENT
    --------------------------------------------------- */

    if (!to) {
      logger.warn(
        {
          subject,
        },
        "Email skipped: recipient email is missing"
      );

      return false;
    }

    /* ---------------------------------------------------
       BASIC EMAIL FORMAT CHECK
    --------------------------------------------------- */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(to))) {
      logger.warn(
        {
          to,
          subject,
        },
        "Email skipped: invalid recipient email"
      );

      return false;
    }

    /* ---------------------------------------------------
       CREATE MAIL OPTIONS
    --------------------------------------------------- */

    const mailOptions = {
      from: `"YarrowTech" <${
        process.env.FROM_EMAIL ||
        process.env.SMTP_USER
      }>`,
      
      to,

      subject,

      html,

      ...(replyTo
        ? {
            replyTo,
          }
        : {}),
    };

    /* ---------------------------------------------------
       SEND EMAIL
    --------------------------------------------------- */

    const info =
      await getTransporter().sendMail(
        mailOptions
      );

    /* ---------------------------------------------------
       LOG SMTP RESULT
    --------------------------------------------------- */

    logger.info(
      {
        to,
        subject,

        // Message ID generated by SMTP
        messageId: info.messageId,

        // Recipients accepted by SMTP server
        accepted: info.accepted,

        // Recipients rejected by SMTP server
        rejected: info.rejected,

        // SMTP server response
        response: info.response,

        // Envelope information
        envelope: info.envelope,
      },
      "Email sent successfully"
    );

    /* ---------------------------------------------------
       CHECK IF RECIPIENT WAS REJECTED
    --------------------------------------------------- */

    if (
      info.rejected &&
      info.rejected.length > 0
    ) {
      logger.warn(
        {
          to,
          subject,
          rejected: info.rejected,
          response: info.response,
        },
        "SMTP rejected one or more recipients"
      );

      return false;
    }

    return true;

  } catch (err) {
    /* ---------------------------------------------------
       SMTP ERROR
    --------------------------------------------------- */

    logger.error(
      {
        err,
        message: err.message,

        to,
        subject,

        code: err.code,

        command: err.command,

        response: err.response,

        responseCode: err.responseCode,

        stack: err.stack,
      },
      "Email send failed"
    );

    return false;
  }
};