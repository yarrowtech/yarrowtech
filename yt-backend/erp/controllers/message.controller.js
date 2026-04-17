import ERPMessage from "../models/Message.js";
import ERPProject from "../models/Project.js";

async function getAccessibleProject(req, projectId) {
  const project = await ERPProject.findById(projectId).lean();
  if (!project) return null;

  const userId = String(req.erpUser?._id || "");
  const userEmail = String(req.erpUser?.email || "").toLowerCase();
  const role = req.erpUser?.role;

  if (role === "admin") return project;
  if (role === "manager" && String(project.manager) === userId) return project;
  if (role === "client" && String(project.client) === userId) return project;
  if (role === "techlead" && String(project.techLeadEmail || "").toLowerCase() === userEmail) {
    return project;
  }

  return null;
}

export const byProject = async (req, res) => {
  try {
    const project = await getAccessibleProject(req, req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const messages = await ERPMessage.find({
      project: req.params.projectId,
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("MESSAGE FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { projectId, text, toEmail, roleTo } = req.body || {};

    if (!projectId || !text?.trim() || !toEmail?.trim()) {
      return res.status(400).json({ message: "projectId, text and toEmail are required" });
    }

    const project = await getAccessibleProject(req, projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newMsg = await ERPMessage.create({
      project: projectId,
      fromEmail: req.erpUser.email,
      toEmail: toEmail.trim().toLowerCase(),
      roleFrom: req.erpUser.role,
      roleTo: roleTo || (req.erpUser.role === "manager" ? "client" : "manager"),
      text: text.trim(),
    });

    res.json({ success: true, message: newMsg });
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
