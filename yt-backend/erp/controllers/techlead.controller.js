import ERPProject from "../models/Project.js";
import ERPProjectStatus from "../models/ProjectStatus.js";
import ERPMessage from "../models/Message.js";
import ERPUser from "../models/User.js";
/* =====================================================
   GET PROJECTS ASSIGNED TO TECH LEAD
===================================================== */
export const getAssigned = async (req, res) => {
  try {
    const projects = await ERPProject.find({
      techLeadEmail: req.erpUser.email,
    });

    res.json({ success: true, projects });
  } catch (err) {
    console.error("❌ GET ASSIGNED ERROR:", err);
    res.status(500).json({ message: "Failed to load assigned projects" });
  }
};

/* =====================================================
   TECH LEAD DASHBOARD STATS ✅ FIXED
===================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const email = req.erpUser.email;

    const totalProjects = await ERPProject.countDocuments({
      techLeadEmail: email,
    });

    const activeProjects = await ERPProject.countDocuments({
      techLeadEmail: email,
      status: { $in: ["pending", "ongoing"] },
    });

    // ✅ ADD THIS (Pending Tasks = Pending Projects)
    const pendingTasks = await ERPProject.countDocuments({
      techLeadEmail: email,
      status: "pending",
    });

    // ✅ OPTIONAL: This month completed projects
    const thisMonthDeployments = await ERPProject.countDocuments({
      techLeadEmail: email,
      status: "completed",
      updatedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    res.json({
      totalProjects,
      activeProjects,
      pendingTasks,
      thisMonthDeployments,
    });
  } catch (err) {
    console.error("❌ TECH LEAD STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

/* =====================================================
   UPDATE PROJECT (STATUS + PROGRESS)
===================================================== */
export const updateProject = async (req, res) => {
  try {
    const { status, progress, note } = req.body;

    const project = await ERPProject.findOneAndUpdate(
      {
        _id: req.params.projectId,
        techLeadEmail: req.erpUser.email,
      },
      { status, progress },
      { new: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or not assigned to you" });
    }

    await ERPProjectStatus.create({
      project: project._id,
      status,
      note,
      updatedByEmail: req.erpUser.email,
    });

    res.json({ success: true, project });
  } catch (err) {
    console.error("❌ UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
};

/* =====================================================
   SEND MESSAGE
===================================================== */
export const sendMessage = async (req, res) => {
  try {
    const { toEmail, text } = req.body;

    const msg = await ERPMessage.create({
      project: req.params.projectId,
      fromEmail: req.erpUser.email,
      toEmail,
      text,
    });

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error("❌ SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};





/* =====================================================
   GET TECH LEAD PROFILE
===================================================== */
export const getProfile = async (req, res) => {
  const user = await ERPUser.findOne({ email: req.erpUser.email }).select(
    "-password"
  );

  res.json(user);
};

/* =====================================================
   UPDATE TECH LEAD PROFILE
===================================================== */
export const updateProfile = async (req, res) => {
  const updated = await ERPUser.findOneAndUpdate(
    { email: req.erpUser.email },
    req.body,
    { new: true }
  ).select("-password");

  res.json(updated);
};