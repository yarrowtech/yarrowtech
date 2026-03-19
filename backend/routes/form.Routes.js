


// import express from "express";
// import { submitRequestDemo, getAllDemoRequests } from "../controllers/requestDemo.Controller.js";

// import { verifyErpToken } from "../erp/middleware/erpAuth.js";
// import verifyRoles from "../erp/middleware/verifyRoles.js";

// const router = express.Router();

// // Public → Normal users submit demo request
// router.post("/demo", submitRequestDemo);

// // Admin → Read all demo requests
// router.get("/demo", verifyErpToken, verifyRoles("admin"), getAllDemoRequests);

// export default router;






import express from "express";
import {
  submitRequestDemo,
  getAllDemoRequests,
  getManagerDemoRequests,
  updateLeadStatusByManager,
} from "../controllers/requestDemo.Controller.js";

import { verifyErpToken } from "../erp/middleware/erpAuth.js";
import verifyRoles from "../erp/middleware/verifyRoles.js";

const router = express.Router();

/* ===============================
   🌐 PUBLIC → SUBMIT DEMO REQUEST
================================ */
router.post("/demo", submitRequestDemo);

/* ===============================
   👑 ADMIN → VIEW ALL CRM LEADS (READ ONLY)
================================ */
router.get(
  "/demo",
  verifyErpToken,
  verifyRoles("admin"),
  getAllDemoRequests
);

/* ===============================
   🧑‍💼 MANAGER → VIEW CRM LEADS
================================ */
router.get(
  "/manager/demo",
  verifyErpToken,
  verifyRoles("manager"),
  getManagerDemoRequests
);

/* ===============================
   🧑‍💼 MANAGER → UPDATE LEAD STATUS
================================ */
router.put(
  "/manager/demo/:id/status",
  verifyErpToken,
  verifyRoles("manager"),
  updateLeadStatusByManager
);

export default router;
