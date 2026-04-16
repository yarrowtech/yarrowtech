// // erp/routes/managerTechlead.routes.js
// import express from "express";

// const router = express.Router();

// /* -----------------------------------------
//    Parse TECHLEADS from .env
// ----------------------------------------- */
// function parseList(str) {
//   if (!str) return [];
//   return str.split(",").map((pair, index) => {
//     const [email, password] = pair.trim().split(":");
//     return {
//       email,
//       password,
//       name: `Tech Lead ${index + 1}`, // Temporary display names
//     };
//   });
// }

// const techLeads = parseList(process.env.TECHLEADS);

// /* -----------------------------------------
//    GET /api/erp/manager/techleads
// ----------------------------------------- */
// router.get("/", (req, res) => {
//   return res.json({
//     success: true,
//     techLeads: techLeads.map((t) => ({
//       email: t.email,
//       name: t.name,
//     })),
//   });
// });

// export default router;




// import express from "express";

// const router = express.Router();

// /* -----------------------------------------
//    Utils → Parse TECHLEADS from .env
//    Format:
//    TECHLEADS=email1:pass1,email2:pass2
// ----------------------------------------- */
// function parseTechLeads(str) {
//   if (!str) return [];

//   return str
//     .split(",")
//     .map((pair, index) => {
//       const [email, password] = pair.trim().split(":");

//       // skip invalid entries
//       if (!email || !password) return null;

//       return {
//         email: email.toLowerCase().trim(),
//         name: `Tech Lead ${index + 1}`, // temporary display name
//       };
//     })
//     .filter(Boolean);
// }

// /* -----------------------------------------
//    Cache parsed tech leads (read once)
// ----------------------------------------- */
// const TECH_LEADS = parseTechLeads(process.env.TECHLEADS);

// /* -----------------------------------------
//    GET /api/erp/manager/techleads
//    Purpose: Populate Tech Lead dropdown
// ----------------------------------------- */
// router.get("/", (req, res) => {
//   res.json({
//     success: true,
//     count: TECH_LEADS.length,
//     techLeads: TECH_LEADS,
//   });
// });

// export default router;
