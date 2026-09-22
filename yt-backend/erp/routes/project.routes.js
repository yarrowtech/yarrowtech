// // erp/routes/project.routes.js
// import express from "express";
// import {
//   getAll,
//   getById,
// } from "../controllers/project.controller.js";
// import { verifyErpToken } from "../middleware/erpAuth.js";

// const router = express.Router();

// /* GET ALL PROJECTS (Manager / Admin / Tech Lead) */
// router.get("/", verifyErpToken, getAll);

// /* GET PROJECT BY ID */
// router.get("/:id", verifyErpToken, getById);

// export default router;





import express from "express";
import {
  getAll,
  getById,
  getManagerProjects,
  updateProjectAdmin,
} from "../controllers/project.controller.js";
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* ===============================
   MANAGER PROJECTS (STATIC FIRST)
=============================== */
router.get(
  "/manager",
  verifyErpToken,
  getManagerProjects
);

/* ===============================
   GET ALL PROJECTS
=============================== */
router.get(
  "/",
  verifyErpToken,
  getAll
);

/* ===============================
   GET PROJECT BY ID (DYNAMIC LAST)
=============================== */
router.get(
  "/:id",
  verifyErpToken,
  getById
);

/* ===============================
   UPDATE PROJECT (Admin only)
=============================== */
router.put(
  "/:id",
  verifyErpToken,
  verifyRoles("admin"),
  updateProjectAdmin
);

export default router;
