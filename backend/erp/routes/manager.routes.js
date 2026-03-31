// import express from "express";
// import {
//   createClientAndProject,
//   getProjects,
//   updateProject,
//   getTechLeads,
// } from "../controllers/manager.controller.js";

// import { verifyErpToken } from "../middleware/erpAuth.js";
// import verifyRoles from "../middleware/verifyRoles.js";

// const router = express.Router();

// /* 🔥 TECH LEAD DROPDOWN */
// router.get(
//   "/techleads",
//   verifyErpToken,
//   verifyRoles("manager"),
//   getTechLeads
// );

// router.post(
//   "/create-project",
//   verifyErpToken,
//   verifyRoles("manager"),
//   createClientAndProject
// );

// router.get(
//   "/projects",
//   verifyErpToken,
//   verifyRoles("manager"),
//   getProjects
// );

// router.put(
//   "/projects/:id",
//   verifyErpToken,
//   verifyRoles("manager"),
//   updateProject
// );

// export default router;









//30.1 - client login


import express from "express";
import {
  createClientAndProject,
  getProjects,
  updateProject,
  getTechLeads,
  deleteClient,            // ✅ NEW
  resetClientPassword,     // ✅ NEW
} from "../controllers/manager.controller.js";

import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* 🔥 TECH LEAD DROPDOWN */
router.get(
  "/techleads",
  verifyErpToken,
  verifyRoles("manager"),
  getTechLeads
);

/* 🔥 CREATE CLIENT + PROJECT */
router.post(
  "/create-project",
  verifyErpToken,
  verifyRoles("manager"),
  createClientAndProject
);

/* 🔥 GET PROJECTS */
router.get(
  "/projects",
  verifyErpToken,
  verifyRoles("manager"),
  getProjects
);

/* 🔥 UPDATE PROJECT */
router.put(
  "/projects/:id",
  verifyErpToken,
  verifyRoles("manager"),
  updateProject
);

/* ============================================================
   NEW ROUTES (NO CHANGE TO OLD LOGIC)
============================================================ */

/* 🔥 DELETE CLIENT */
router.delete(
  "/client/:id",
  verifyErpToken,
  verifyRoles("manager"),
  deleteClient
);

/* 🔥 RESET CLIENT PASSWORD */
router.put(
  "/client/reset-password/:id",
  verifyErpToken,
  verifyRoles("manager"),
  resetClientPassword
);

export default router;