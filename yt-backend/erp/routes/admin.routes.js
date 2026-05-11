// import express from "express";
// import {
//   getAdminStats,
//   getERPUsers,
//   createERPUser,
//   toggleUserStatus,
//   resetUserPassword,
// } from "../controllers/admin.controller.js";

// import { verifyErpToken } from "../middleware/erpAuth.js";
// import verifyRoles from "../middleware/verifyRoles.js";

// const router = express.Router();

// /* ============================================================
//    🔐 ADMIN AUTH + ROLE GUARD
// ============================================================ */
// router.use(verifyErpToken, verifyRoles("admin"));

// /* ============================================================
//    📊 ADMIN DASHBOARD
// ============================================================ */
// router.get("/stats", getAdminStats);

// /* ============================================================
//    👥 USER MANAGEMENT (ADMIN)
// ============================================================ */

// // Get all ERP users
// router.get("/users", getERPUsers);

// // Create new ERP user (manager / techlead / admin)
// router.post("/create-user", createERPUser);

// // Toggle user status (active / inactive)
// router.put("/user/:id/toggle-status", toggleUserStatus);

// // Reset user password
// router.put("/user/:id/reset-password", resetUserPassword);

// export default router;






import express from "express";

/* ================= CONTROLLERS ================= */
import {
  getAdminStats,
  getERPUsers,
  createERPUser,
  toggleUserStatus,
  resetUserPassword,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/admin.controller.js";
import {
  addProductUserPayment,
  getProductUserAnalytics,
  getManagersForAssignment,
  getProductCatalog,
  getProductUserDetails,
  getProductUsers,
  updateProductUserPaymentSummary,
} from "../controllers/productUser.controller.js";

/* ================= MODELS ================= */
import ERPClient from "../models/Client.js";
import ERPProject from "../models/Project.js";
import Career from "../../models/Career.js";
import cloudinary from "../../utils/cloudinary.js";

/* ================= MIDDLEWARE ================= */
import { verifyErpToken } from "../middleware/erpAuth.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = express.Router();

/* ============================================================
   🔐 ADMIN AUTH + ROLE GUARD (GLOBAL)
============================================================ */
router.use(verifyErpToken, verifyRoles("admin"));

/* ============================================================
   👤 ADMIN PROFILE / SETTINGS
============================================================ */
router.get("/profile",                 getAdminProfile);
router.put("/profile",                 updateAdminProfile);
router.post("/profile/change-password", changeAdminPassword);

/* ============================================================
   📊 ADMIN DASHBOARD
============================================================ */
router.get("/stats", getAdminStats);

/* ============================================================
   👥 ERP USER MANAGEMENT (ADMIN)
============================================================ */

// Get all ERP users (admin / manager / techlead)
router.get("/users", getERPUsers);

// Create ERP user
router.post("/create-user", createERPUser);

// Toggle ERP user status
router.put("/user/:id/toggle-status", toggleUserStatus);

// Reset ERP user password
router.put("/user/:id/reset-password", resetUserPassword);

// Product user management
router.get("/product-users", getProductUsers);
router.get("/product-users/analytics", getProductUserAnalytics);
router.get("/product-users/catalog", getProductCatalog);
router.get("/product-users/managers", getManagersForAssignment);
router.get("/product-users/:id", getProductUserDetails);
router.put("/product-users/:id/payment-summary", updateProductUserPaymentSummary);
router.post("/product-users/:id/payments", addProductUserPayment);

/* ============================================================
   👤 CLIENT MANAGEMENT (ADMIN ONLY)
============================================================ */

// Get all clients
router.get("/clients", async (req, res) => {
  try {
    const clients = await ERPClient.find().select("-password");
    res.json(clients);
  } catch (err) {
    console.error("❌ GET CLIENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
});

// Create client account
router.post("/clients", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const exists = await ERPClient.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Client already exists" });
    }

    const tempPassword = "12345"; // 🔐 later: generate dynamically

    const client = await ERPClient.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role: "client",
      status: "active",
    });

    res.status(201).json({
      success: true,
      tempPassword,
      client,
    });
  } catch (err) {
    console.error("❌ CREATE CLIENT ERROR:", err);
    res.status(500).json({ message: "Failed to create client" });
  }
});

// Activate / Deactivate client
router.patch("/clients/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const client = await ERPClient.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.status = status;
    await client.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ UPDATE CLIENT STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// Reset client password
router.post("/clients/:id/reset-password", async (req, res) => {
  try {
    const client = await ERPClient.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const tempPassword = "12345";
    client.password = tempPassword;
    await client.save();

    res.json({
      success: true,
      tempPassword,
    });
  } catch (err) {
    console.error("❌ RESET CLIENT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

/* ============================================================
   📦 CLIENT DETAILS + PROJECTS (ADMIN)
============================================================ */

// Get client details + all projects
router.get("/clients/:id/details", async (req, res) => {
  try {
    const client = await ERPClient.findById(req.params.id).select("-password");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const projects = await ERPProject.find({ clientId: client._id })
      .populate("managerId", "name email")
      .populate("techLeadId", "name email");

    res.json({ client, projects });
  } catch (err) {
    console.error("❌ CLIENT DETAILS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch client details" });
  }
});

// Create project for a client
router.post("/clients/:id/projects", async (req, res) => {
  try {
    const { name, paymentAmount, expectedDeliveryDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await ERPProject.create({
      name,
      clientId: req.params.id,
      paymentAmount: paymentAmount || 0,
      expectedDeliveryDate: expectedDeliveryDate || null,
      status: "active",
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("❌ CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
});

/* ============================================================
   🔧 ONE-TIME MIGRATION: Set existing resumes to public access
   Call once: POST /erp/admin/migrate-resumes
============================================================ */
router.post("/migrate-resumes", async (req, res) => {
  try {
    const careers = await Career.find({});
    const results = [];

    for (const career of careers) {
      let publicId = career.resumePublicId || "";
      if (!publicId && career.resumeUrl) {
        const match = career.resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (match) publicId = match[1];
      }
      if (!publicId) {
        results.push({ id: career._id, status: "skipped", reason: "no publicId" });
        continue;
      }
      try {
        await cloudinary.api.update(publicId, {
          resource_type: "raw",
          access_control: [{ access_type: "anonymous" }],
        });
        results.push({ id: career._id, publicId, status: "updated" });
      } catch (e) {
        results.push({ id: career._id, publicId, status: "failed", error: e.message });
      }
    }

    res.json({ total: careers.length, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
