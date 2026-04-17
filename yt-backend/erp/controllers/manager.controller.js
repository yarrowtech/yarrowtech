// import ERPClient from "../models/Client.js";
// import ERPProject from "../models/Project.js";
// import ERPUser from "../models/User.js";

// import { generatePassword } from "../utils/generatePassword.js";
// import sendEmail from "../utils/sendEmail.js";

// /* ============================================================
//    MANAGER → GET TECH LEADS
// ============================================================ */
// export const getTechLeads = async (req, res) => {
//   try {
//     const techLeads = await ERPUser.find(
//       { role: "techlead", status: "active" },
//       { name: 1, email: 1 }
//     );

//     res.json({ success: true, techLeads });
//   } catch (err) {
//     console.error("❌ GET TECH LEADS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ============================================================
//    MANAGER → CREATE CLIENT + PROJECT  ✅ FIXED
// ============================================================ */
// export const createClientAndProject = async (req, res) => {
//   try {
//     const {
//       projectId,
//       name, // project name
//       clientName,
//       clientEmail,
//       expectedDelivery,
//       techLeadEmail,
//     } = req.body;

//     /* 🔐 MANAGER FROM TOKEN */
//     const managerId = req.erpUser?.id || req.erpUser?._id;

//     if (!managerId) {
//       return res.status(401).json({
//         message: "Invalid manager token",
//       });
//     }

//     /* ================= VALIDATE TECH LEAD ================= */
//     const techLead = await ERPUser.findOne({
//       email: techLeadEmail.toLowerCase(),
//       role: "techlead",
//       status: "active",
//     });

//     if (!techLead) {
//       return res.status(400).json({
//         message: "Invalid or inactive Tech Lead selected",
//       });
//     }

//     /* ================= FIND / CREATE CLIENT ================= */
//     let client = await ERPClient.findOne({
//       email: clientEmail.toLowerCase(),
//     });

//     let generatedPassword;

//     if (!client) {
//       generatedPassword = generatePassword();

//   const newClient = new ERPClient({
//   name: clientName,
//   email: clientEmail.toLowerCase(),
//   password: generatedPassword, // 🔐 WILL BE HASHED
//   status: "active",
//   role: "client",
// });

// client = await newClient.save(); // ✅ GUARANTEES pre("save") runs

//       await sendEmail(
//         clientEmail,
//         "Your YarrowTech ERP Login",
//         `Welcome to YarrowTech ERP!

// Login URL: https://yourdomain.com/erp

// Email: ${clientEmail}
// Password: ${generatedPassword}

// Please change your password after login.`
//       );
//     }

//     /* ================= CREATE PROJECT ================= */
//     const project = await ERPProject.create({
//       projectId,
//       name,
//       client: client._id,
//       clientName,
//       clientEmail: client.email,

//       /* ✅ REAL RELATION */
//       manager: managerId,

//       /* DISPLAY / EMAIL */
//       managerEmail: req.erpUser.email,
//       techLeadEmail: techLead.email,

//       expectedDelivery,
//       status: "pending",
//       progress: 0,
//     });

//     res.json({
//       success: true,
//       message: "Client & Project created successfully",
//       project,
//     });
//   } catch (err) {
//     console.error("❌ CREATE PROJECT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ============================================================
//    MANAGER → GET PROJECTS  ✅ FIXED
// ============================================================ */
// export const getProjects = async (req, res) => {
//   try {
//     const managerId = req.erpUser?.id || req.erpUser?._id;

//     if (!managerId) {
//       return res.status(401).json({
//         message: "Invalid manager token",
//       });
//     }

//     const projects = await ERPProject.find({
//       manager: managerId,
//     })
//       .populate("client", "name email status")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       projects,
//     });
//   } catch (err) {
//     console.error("❌ GET MANAGER PROJECTS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ============================================================
//    MANAGER → UPDATE PROJECT
// ============================================================ */
// export const updateProject = async (req, res) => {
//   try {
//     const allowed = [
//       "name",
//       "techLeadEmail",
//       "expectedDelivery",
//       "status",
//       "progress",
//       "projectDetails",
//     ];

//     const updateData = {};
//     allowed.forEach((key) => {
//       if (req.body[key] !== undefined) {
//         updateData[key] = req.body[key];
//       }
//     });

//     const updated = await ERPProject.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json({
//       success: true,
//       message: "Project updated successfully",
//       project: updated,
//     });
//   } catch (err) {
//     console.error("❌ UPDATE PROJECT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };












import ERPClient from "../models/Client.js";
import DeletedClientHistory from "../models/DeletedClientHistory.js";
import ERPProject from "../models/Project.js";
import ERPUser from "../models/User.js";

import { generatePassword } from "../utils/generatePassword.js";
import sendEmail from "../utils/sendEmail.js";

const getCurrentManagerId = (req) => req.erpUser?.id || req.erpUser?._id;
const getCurrentManagerEmail = (req) =>
  String(req.erpUser?.email || "").toLowerCase();

/* ============================================================
   MANAGER → GET TECH LEADS
============================================================ */
export const getTechLeads = async (req, res) => {
  try {
    const techLeads = await ERPUser.find(
      { role: "techlead", status: "active" },
      { name: 1, email: 1 }
    );

    res.json({ success: true, techLeads });
  } catch (err) {
    console.error("❌ GET TECH LEADS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   MANAGER → CREATE CLIENT + PROJECT  (ONLY FIXED HASHING)
============================================================ */
export const createClientAndProject = async (req, res) => {
  try {
    const {
      projectId,
      name,
      clientName,
      clientEmail,
      expectedDelivery,
      techLeadEmail,
    } = req.body;

    const managerId = req.erpUser?.id || req.erpUser?._id;

    if (!managerId) {
      return res.status(401).json({
        message: "Invalid manager token",
      });
    }

    const techLead = await ERPUser.findOne({
      email: techLeadEmail.toLowerCase(),
      role: "techlead",
      status: "active",
    });

    if (!techLead) {
      return res.status(400).json({
        message: "Invalid or inactive Tech Lead selected",
      });
    }

    let client = await ERPClient.findOne({
      email: clientEmail.toLowerCase(),
    });

    let generatedPassword;

    if (!client) {
      generatedPassword = generatePassword();

      const newClient = new ERPClient({
        name: clientName,
        email: clientEmail.toLowerCase(),
        // The client model hashes passwords in its pre-save hook.
        password: generatedPassword,
        status: "active",
        role: "client",
      });

      client = await newClient.save();

      /* 🔥 EMAIL SAFE (no crash) */
      try {
        await sendEmail(
          clientEmail,
          "Your YarrowTech ERP Login",
          `Welcome to YarrowTech ERP!

Login URL: https://yourdomain.com/erp

Email: ${clientEmail}
Password: ${generatedPassword}

Please change your password after login.`
        );
      } catch (err) {
        console.error("❌ Email failed:", err.message);
      }
    }

    const project = await ERPProject.create({
      projectId,
      name,
      client: client._id,
      clientName,
      clientEmail: client.email,

      manager: managerId,
      managerEmail: req.erpUser.email,
      techLeadEmail: techLead.email,

      expectedDelivery,
      status: "pending",
      progress: 0,
    });

    res.json({
      success: true,
      message: "Client & Project created successfully",
      project,
    });
  } catch (err) {
    console.error("❌ CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   MANAGER → GET PROJECTS (UNCHANGED)
============================================================ */
export const getProjects = async (req, res) => {
  try {
    const managerId = getCurrentManagerId(req);
    const managerEmail = getCurrentManagerEmail(req);

    if (!managerId) {
      return res.status(401).json({
        message: "Invalid manager token",
      });
    }

    const accessQuery = [{ manager: managerId }];
    if (managerEmail) {
      accessQuery.push({ managerEmail });
    }

    const projects = await ERPProject.find({
      $or: accessQuery,
    })
      .populate("client", "name email status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("❌ GET MANAGER PROJECTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   MANAGER → UPDATE PROJECT (UNCHANGED)
============================================================ */
export const updateProject = async (req, res) => {
  try {
    const managerId = getCurrentManagerId(req);
    const managerEmail = getCurrentManagerEmail(req);

    if (!managerId) {
      return res.status(401).json({
        message: "Invalid manager token",
      });
    }

    const allowed = [
      "name",
      "techLeadEmail",
      "expectedDelivery",
      "status",
      "progress",
      "projectDetails",
    ];

    const updateData = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    const accessQuery = [{ manager: managerId }];
    if (managerEmail) {
      accessQuery.push({ managerEmail });
    }

    const updated = await ERPProject.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: accessQuery,
      },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Project not found or you do not have access",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project: updated,
    });
  } catch (err) {
    console.error("❌ UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   NEW → DELETE CLIENT
============================================================ */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.erpUser?.id || req.erpUser?._id;

    const client = await ERPClient.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const projects = await ERPProject.find({ client: id }).lean();

    await DeletedClientHistory.create({
      originalClientId: client._id,
      managerId,
      managerEmail: req.erpUser?.email || "",
      name: client.name,
      email: client.email,
      status: client.status || "inactive",
      company: client.company || "",
      clientCode: client.clientId || "",
      phone: client.phone || "",
      address: client.address || "",
      projects: projects.map((project) => ({
        projectId: project.projectId,
        name: project.name,
        status: project.status,
        progress: project.progress || 0,
        expectedDelivery: project.expectedDelivery || null,
      })),
      deletedAt: new Date(),
    });

    await ERPProject.deleteMany({ client: id });
    await ERPClient.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE CLIENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   NEW → RESET CLIENT PASSWORD
============================================================ */
export const resetClientPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};

    const client = await ERPClient.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const newPassword = password?.trim();
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    client.password = newPassword;
    await client.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });

    try {
      await sendEmail(
        client.email,
        "Password Reset - YarrowTech ERP",
        `Your password has been reset.

Email: ${client.email}
New Password: ${newPassword}`
      );
    } catch (err) {
      console.error("❌ Email failed:", err.message);
    }

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDeletedClientHistory = async (req, res) => {
  try {
    const managerId = req.erpUser?.id || req.erpUser?._id;

    if (!managerId) {
      return res.status(401).json({
        message: "Invalid manager token",
      });
    }

    const history = await DeletedClientHistory.find({
      managerId,
    }).sort({ deletedAt: -1 });

    res.json({
      success: true,
      history,
    });
  } catch (err) {
    console.error("❌ DELETED CLIENT HISTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
