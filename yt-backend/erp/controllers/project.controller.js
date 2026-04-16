// // erp/controllers/project.controller.js
// import ERPProject from "../models/Project.js";

// export const getAll = async (req, res) => {
//   const projects = await ERPProject.find().populate("client");
//   res.json({ success: true, projects });
// };

// export const getById = async (req, res) => {
//   const project = await ERPProject.findById(req.params.id).populate("client");
//   res.json({ success: true, project });
// };



import ERPProject from "../models/Project.js";

/* ===============================
   GET ALL PROJECTS
   (Admin / Tech Lead)
=============================== */
export const getAll = async (req, res) => {
  try {
    const projects = await ERPProject.find()
      .populate("client");

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("❌ Get all projects error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===============================
   GET PROJECT BY ID
=============================== */
export const getById = async (req, res) => {
  try {
    const project = await ERPProject.findById(req.params.id)
      .populate("client");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Invalid project ID",
    });
  }
};

/* ===============================
   GET MANAGER PROJECTS ✅ FIXED
=============================== */
export const getManagerProjects = async (req, res) => {
  try {
    // 🔐 CORRECT SOURCE FROM MIDDLEWARE
    const managerId = req.erpUser?.id || req.erpUser?._id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid manager token",
      });
    }

    const projects = await ERPProject.find({
      manager: managerId,
    }).populate("client");

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("❌ Manager projects error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager projects",
    });
  }
};
