import ERPProject from "../models/Project.js";

const getCurrentErpUserId = (req) => req.erpUser?._id || req.erpUser?.id;
const getCurrentErpUserEmail = (req) =>
  String(req.erpUser?.email || "").toLowerCase();

/* ===============================
   GET ALL PROJECTS
   (Admin / Tech Lead)
=============================== */
export const getAll = async (req, res) => {
  try {
    const projects = await ERPProject.find().populate("client");

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("Get all projects error:", err);
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
    const query = { _id: req.params.id };
    const currentUserId = getCurrentErpUserId(req);
    const currentUserEmail = getCurrentErpUserEmail(req);

    if (req.erpUser?.role === "manager") {
      query.$or = [{ manager: currentUserId }];

      if (currentUserEmail) {
        query.$or.push({ managerEmail: currentUserEmail });
      }
    }

    if (req.erpUser?.role === "client") {
      query.$or = [{ client: currentUserId }];

      if (currentUserEmail) {
        query.$or.push({ clientEmail: currentUserEmail });
      }
    }

    const project = await ERPProject.findOne(query).populate("client");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have access",
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
   GET MANAGER PROJECTS
=============================== */
export const getManagerProjects = async (req, res) => {
  try {
    const managerId = getCurrentErpUserId(req);
    const managerEmail = getCurrentErpUserEmail(req);

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid manager token",
      });
    }

    const managerQuery = [{ manager: managerId }];
    if (managerEmail) {
      managerQuery.push({ managerEmail });
    }

    const projects = await ERPProject.find({
      $or: managerQuery,
    }).populate("client");

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("Manager projects error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager projects",
    });
  }
};
