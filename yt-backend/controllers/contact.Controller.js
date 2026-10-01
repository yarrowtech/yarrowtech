// import { Contact } from "../models/contact.js";
// import logger from "../utils/logger.js";
// import sendEmail, { escapeHtml, getTeamInbox } from "../erp/utils/sendEmail.js";

// /* -------------------------------------------------------
//    SUBMIT CONTACT FORM  (POST /api/contact)
// ------------------------------------------------------- */
// export const submitContact = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     // Basic validation
//     if (!name || !email || !message) {
//       return res.status(400).json({
//         success: false,
//         error: "All fields (name, email, message) are required.",
//       });
//     }

//     // Save to DB
//     const savedEntry = await Contact.create({ name, email, message });

//     // Email is fire-and-forget: the message is already saved, so an SMTP
//     // problem never shows the visitor an error.
//     const safeName = escapeHtml(name);
//     const safeEmail = escapeHtml(email);
//     const safeMessage = escapeHtml(message);
//     const teamInbox = getTeamInbox();

//     // Alert to YarrowTech team (reply goes straight to the visitor)
//     if (teamInbox) {
//       sendEmail(
//         teamInbox,
//         `📩 New Contact Message from ${String(name).slice(0, 100)}`,
//         `
//         <div style="font-family:Arial; padding:20px;">
//           <h2>📬 New Contact Form Submission</h2>
//           <p><strong>Name:</strong> ${safeName}</p>
//           <p><strong>Email:</strong> ${safeEmail}</p>
//           <p><strong>Message:</strong></p>
//           <p style="background:#f1f1f1;padding:10px;border-radius:6px;">
//             ${safeMessage}
//           </p>
//           <hr/>
//           <p style="font-size:12px;color:#666;">Sent from YarrowTech Website</p>
//         </div>
//         `,
//         { replyTo: email }
//       );
//     }

//     // Auto-reply to visitor
//     sendEmail(
//       email,
//       "Thank you for contacting YarrowTech!",
//       `
//       <div style="font-family:Arial; padding:20px; background:#071a2d; color:white; border-radius:12px;">
//         <h2 style="color:#ff9a1f;">Thank you, ${safeName}! 🙌</h2>
//         <p>We’ve received your message and our support team will respond shortly.</p>

//         <div style="margin-top:15px; padding:12px 15px; background:#0d2538; border-radius:8px;">
//           <strong>Your Message:</strong><br/>
//           <em>"${safeMessage}"</em>
//         </div>

//         <p style="margin-top:20px;">Warm regards,<br/>— Team YarrowTech</p>
//       </div>
//       `
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Message sent successfully.",
//       contact: savedEntry,
//     });

//   } catch (error) {
//     logger.error({ err: error }, "Contact Form Error");

//     return res.status(500).json({
//       success: false,
//       error:
//         process.env.NODE_ENV === "production"
//           ? "Something went wrong. Please try again later."
//           : error.message,
//     });
//   }
// };

// /* -------------------------------------------------------
//    GET ALL CONTACTS (GET /api/contact/all) – ADMIN
// ------------------------------------------------------- */
// export const getAllContacts = async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       total: contacts.length,
//       contacts,
//     });
//   } catch (error) {
//     logger.error({ err: error }, "Error fetching contacts");
//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch contacts",
//     });
//   }
// };











import { Contact } from "../models/contact.js";
import logger from "../utils/logger.js";
import sendEmail, {
  escapeHtml,
  getTeamInbox,
} from "../erp/utils/sendEmail.js";

/* -------------------------------------------------------
   SUBMIT CONTACT FORM
   POST /api/contact
------------------------------------------------------- */
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ---------------------------------------------------
    // Basic validation
    // ---------------------------------------------------
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields (name, email, message) are required.",
      });
    }

    // ---------------------------------------------------
    // Basic email validation
    // ---------------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address.",
      });
    }

    // ---------------------------------------------------
    // Save contact form submission to database
    // ---------------------------------------------------
    const savedEntry = await Contact.create({
      name,
      email,
      message,
    });

    // ---------------------------------------------------
    // Escape user input before putting it into HTML
    // ---------------------------------------------------
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // ---------------------------------------------------
    // Get YarrowTech team inbox
    // ---------------------------------------------------
    const teamInbox = getTeamInbox();

    /* ===================================================
       1. SEND EMAIL TO YARROWTECH TEAM
       =================================================== */

    if (teamInbox) {
      await sendEmail(
        teamInbox,
        `📩 New Contact Message from ${String(name).slice(0, 100)}`,
        `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: 0 auto;
            padding: 25px;
            background: #ffffff;
            color: #222222;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
          ">

            <h2 style="color: #071a2d;">
              📬 New Contact Form Submission
            </h2>

            <hr style="border: none; border-top: 1px solid #eeeeee;" />

            <p>
              <strong>Name:</strong>
              ${safeName}
            </p>

            <p>
              <strong>Email:</strong>
              ${safeEmail}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <div style="
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin-top: 10px;
              white-space: pre-wrap;
            ">
              ${safeMessage}
            </div>

            <hr style="
              border: none;
              border-top: 1px solid #eeeeee;
              margin-top: 25px;
            " />

            <p style="
              font-size: 12px;
              color: #777777;
            ">
              Sent from YarrowTech Website
            </p>

          </div>
        `,
        {
          // When YarrowTech clicks Reply,
          // the reply will go to the visitor.
          replyTo: email,
        }
      );
    }

    /* ===================================================
       2. SEND CONFIRMATION EMAIL TO VISITOR
       =================================================== */

    const visitorEmailSent = await sendEmail(
      email,
      "Thank you for contacting YarrowTech!",
      `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: 0 auto;
          padding: 25px;
          background: #071a2d;
          color: #ffffff;
          border-radius: 12px;
        ">

          <h2 style="
            color: #ff9a1f;
            margin-bottom: 20px;
          ">
            Thank you, ${safeName}! 🙌
          </h2>

          <p style="
            font-size: 15px;
            line-height: 1.6;
          ">
            We’ve successfully received your message.
            Our team will review your request and get back
            to you shortly.
          </p>

          <div style="
            margin-top: 20px;
            padding: 15px;
            background: #0d2538;
            border-radius: 8px;
          ">

            <strong style="color: #ff9a1f;">
              Your Message:
            </strong>

            <br /><br />

            <em style="
              color: #dddddd;
              line-height: 1.6;
            ">
              "${safeMessage}"
            </em>

          </div>

          <p style="
            margin-top: 25px;
            line-height: 1.6;
          ">
            If you have any additional information,
            you can simply reply to this email.
          </p>

          <p style="
            margin-top: 25px;
            line-height: 1.6;
          ">
            Warm regards,<br />
            <strong>Team YarrowTech</strong>
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #24445c;
            margin-top: 30px;
          " />

          <p style="
            font-size: 12px;
            color: #9aa9b5;
            text-align: center;
          ">
            This is an automated confirmation email from YarrowTech.
          </p>

        </div>
      `,
      {
        // If the visitor replies to the confirmation,
        // it goes to YarrowTech.
        replyTo: teamInbox || process.env.SMTP_USER,
      }
    );

    /* ===================================================
       3. RESPONSE
       =================================================== */

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
      emailConfirmationSent: visitorEmailSent,
      contact: savedEntry,
    });

  } catch (error) {
    // ---------------------------------------------------
    // Log error
    // ---------------------------------------------------
    logger.error(
      {
        err: error,
        message: error.message,
        stack: error.stack,
      },
      "Contact Form Error"
    );

    // ---------------------------------------------------
    // Return error response
    // ---------------------------------------------------
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Something went wrong. Please try again later."
          : error.message,
    });
  }
};

/* -------------------------------------------------------
   GET ALL CONTACTS
   GET /api/contact/all
   ADMIN
------------------------------------------------------- */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: contacts.length,
      contacts,
    });

  } catch (error) {
    logger.error(
      {
        err: error,
        message: error.message,
      },
      "Error fetching contacts"
    );

    return res.status(500).json({
      success: false,
      error: "Failed to fetch contacts",
    });
  }
};