import ERPClient from "../models/Client.js";
import { editableSrsFilter } from "./srs.controller.js";
import ERPMessage from "../models/Message.js";
import ERPPayment from "../models/Payment.js";
import ERPProject, {
  REQUIREMENT_LIST_FIELDS,
  REQUIREMENT_PRIORITIES,
  REQUIREMENT_STRING_FIELDS,
} from "../models/Project.js";
import { calculateProjectPaymentSummary } from "../utils/paymentSummary.js";
import logger from "../../utils/logger.js";
import cloudinary from "../../utils/cloudinary.js";
import { MAX_PROJECT_DOCS } from "../../middleware/uploadProjectDocument.js";

const getClientId = (req) => req.erpUser?._id || req.erpUser?.id;

async function findClientOrFail(req, res) {
  const clientId = getClientId(req);

  if (!clientId) {
    res.status(401).json({ message: "Invalid client token" });
    return null;
  }

  const client = await ERPClient.findById(clientId);
  if (!client) {
    res.status(404).json({ message: "Client not found" });
    return null;
  }

  return client;
}

async function getClientProjects(clientId) {
  return ERPProject.find({ client: clientId })
    .sort({ createdAt: -1 })
    .lean();
}

export const getMyProjects = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const projects = await getClientProjects(client._id);

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    logger.error({ err: err }, "Client projects error");
    res.status(500).json({ message: "Failed to fetch client projects" });
  }
};

const cleanList = (value, max = 50) =>
  (Array.isArray(value) ? value : [])
    .map((item) => String(item || "").trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, max);

export const updateProjectRequirements = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const project = await ERPProject.findOne({
      _id: req.params.projectId,
      client: client._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const body = req.body || {};
    if (project.srsLockedAt) return res.status(409).json({ message: "Both sides have agreed. This SRS is locked" });
    if (body.srsRevision !== (project.srsRevision || 0)) {
      return res.status(409).json({ message: "The SRS changed. Reload the project before saving or approving" });
    }
    const requirements = { updatedAt: new Date() };

    REQUIREMENT_STRING_FIELDS.forEach((key) => {
      requirements[key] = String(body[key] || "").trim().slice(0, 3000);
    });
    REQUIREMENT_LIST_FIELDS.forEach((key) => {
      requirements[key] = cleanList(body[key], key === "brandColors" ? 12 : 50);
    });

    requirements.functionalRequirements = (
      Array.isArray(body.functionalRequirements) ? body.functionalRequirements : []
    )
      .map((item) => ({
        title: String(item?.title || "").trim().slice(0, 200),
        description: String(item?.description || "").trim().slice(0, 1500),
        priority: REQUIREMENT_PRIORITIES.includes(item?.priority)
          ? item.priority
          : "Should have",
      }))
      .filter((item) => item.title)
      .slice(0, 100);

    if (requirements.finalAcceptance && requirements.finalAcceptance !== "yes") {
      return res.status(400).json({ message: "Invalid final acceptance value" });
    }
    if (requirements.finalAcceptance === "yes") {
      const date = requirements.finalAcceptanceDate;
      const parsed = new Date(date);
      if (!requirements.finalAcceptanceName || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        return res.status(400).json({ message: "Enter a full name and valid date for final acceptance" });
      }
    } else {
      requirements.finalAcceptanceName = "";
      requirements.finalAcceptanceDate = "";
    }

    if (requirements.approved === "yes") {
      if (!project.srsPaymentTerms?.updatedAt || requirements.paymentApproved !== "yes") {
        return res.status(400).json({ message: "Review and approve the manager's payment terms before approving the SRS" });
      }
      if (body.paymentTermsUpdatedAt !== new Date(project.srsPaymentTerms.updatedAt).toISOString()) {
        return res.status(409).json({ message: "Payment terms changed. Reload and review them before approving" });
      }
      if (!requirements.approvalName || !requirements.functionalRequirements.length) {
        return res.status(400).json({ message: "A signature and at least one requirement are needed for client approval" });
      }
      requirements.approvedOn = new Date().toISOString().slice(0, 10);
      requirements.paymentApprovedOn = requirements.approvedOn;
    } else {
      requirements.approved = "";
      requirements.approvalName = "";
      requirements.approvedOn = "";
      requirements.paymentApproved = "";
      requirements.paymentApprovedOn = "";
    }
    const updated = await ERPProject.findOneAndUpdate(editableSrsFilter(project),
      { $set: { requirements }, $inc: { srsRevision: 1 } }, { new: true });
    if (!updated) return res.status(409).json({ message: "The SRS changed or was locked. Reload the project" });

    res.json({
      success: true,
      message: "Project requirements saved",
      requirements: updated.requirements,
      srsRevision: updated.srsRevision,
    });
  } catch (err) {
    logger.error({ err: err }, "Client project requirements error");
    res.status(500).json({ message: "Failed to save project requirements" });
  }
};

const removeStoredFile = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    logger.error({ err }, "Failed to delete project document from storage");
  }
};

export const uploadProjectDocumentFile = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) {
      await removeStoredFile(req.file?.filename);
      return;
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please choose a file to upload" });
    }

    const project = await ERPProject.findOne({
      _id: req.params.projectId,
      client: client._id,
    });

    if (!project) {
      await removeStoredFile(req.file.filename);
      return res.status(404).json({ message: "Project not found" });
    }

    if ((project.requirementDocuments || []).length >= MAX_PROJECT_DOCS) {
      await removeStoredFile(req.file.filename);
      return res
        .status(400)
        .json({ message: `You can upload up to ${MAX_PROJECT_DOCS} documents` });
    }

    if (project.srsLockedAt) {
      await removeStoredFile(req.file.filename);
      return res.status(409).json({ message: "This SRS is locked. Its attachments cannot be changed" });
    }
    const document = {
      name: req.file.originalname,
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
    };
    const updated = await ERPProject.findOneAndUpdate(editableSrsFilter(project), {
      $push: { requirementDocuments: document }, $inc: { srsRevision: 1 },
      $set: { "requirements.approved": "", "requirements.approvalName": "", "requirements.approvedOn": "", "requirements.paymentApproved": "", "requirements.paymentApprovedOn": "" },
    }, { new: true });
    if (!updated) {
      await removeStoredFile(req.file.filename);
      return res.status(409).json({ message: "The SRS changed or was locked. Reload the project" });
    }

    res.status(201).json({
      success: true,
      message: "Document uploaded",
      documents: updated.requirementDocuments,
      srsRevision: updated.srsRevision,
    });
  } catch (err) {
    logger.error({ err: err }, "Client project document upload error");
    res.status(500).json({ message: "Failed to upload document" });
  }
};

export const deleteProjectDocument = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const project = await ERPProject.findOne({
      _id: req.params.projectId,
      client: client._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const doc = project.requirementDocuments.id(req.params.docId);
    if (project.srsLockedAt) return res.status(409).json({ message: "This SRS is locked. Its attachments cannot be changed" });
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const publicId = doc.publicId;
    const updated = await ERPProject.findOneAndUpdate(editableSrsFilter(project), {
      $pull: { requirementDocuments: { _id: doc._id } }, $inc: { srsRevision: 1 },
      $set: { "requirements.approved": "", "requirements.approvalName": "", "requirements.approvedOn": "", "requirements.paymentApproved": "", "requirements.paymentApprovedOn": "" },
    }, { new: true });
    if (!updated) return res.status(409).json({ message: "The SRS changed or was locked. Reload the project" });
    await removeStoredFile(publicId);

    res.json({
      success: true,
      message: "Document removed",
      documents: updated.requirementDocuments,
      srsRevision: updated.srsRevision,
    });
  } catch (err) {
    logger.error({ err: err }, "Client project document delete error");
    res.status(500).json({ message: "Failed to remove document" });
  }
};

export const getClientDashboard =async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const projects = await getClientProjects(client._id);
    const projectIds = projects.map((project) => project._id);
    const payments = await ERPPayment.find({
      project: { $in: projectIds },
    }).lean();

    const paymentsByProject = payments.reduce((acc, payment) => {
      const key = String(payment.project);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(payment);
      return acc;
    }, {});

    const totalProjects = projects.length;
    const completedProjects = projects.filter(
      (project) => String(project.status).toLowerCase() === "completed"
    ).length;
    const pendingProjects = projects.filter((project) => {
      const status = String(project.status).toLowerCase();
      return status !== "completed" && status !== "paid";
    }).length;
    const totalPayments = payments.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    );

    const paymentSummary = projects.reduce(
      (acc, project) => {
        const summary = calculateProjectPaymentSummary(
          project,
          paymentsByProject[String(project._id)] || []
        );

        acc.totalPayment += summary.totalPayment;
        acc.paidAmount += summary.paidAmount;
        acc.pendingAmount += summary.pendingAmount;
        acc.failedAmount += summary.failedAmount;
        acc.dueAmount += summary.dueAmount;
        return acc;
      },
      {
        totalPayment: 0,
        paidAmount: 0,
        pendingAmount: 0,
        failedAmount: 0,
        dueAmount: 0,
      }
    );

    const statusBreakdown = projects.reduce((acc, project) => {
      const key = project.status || "pending";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const recentProjects = projects.slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalProjects,
        completedProjects,
        pendingProjects,
        totalPayments,
        paidAmount: paymentSummary.paidAmount,
        pendingAmount: paymentSummary.pendingAmount,
        dueAmount: paymentSummary.dueAmount,
        totalContractValue: paymentSummary.totalPayment,
      },
      statusBreakdown,
      recentProjects,
    });
  } catch (err) {
    logger.error({ err: err }, "Client dashboard error");
    res.status(500).json({ message: "Failed to fetch client dashboard" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const projects = await getClientProjects(client._id);
    const projectIds = projects.map((project) => project._id);

    const payments = await ERPPayment.find({
      project: { $in: projectIds },
    })
      .populate("project", "name projectId totalPayment")
      .sort({ paymentDate: -1, createdAt: -1 })
      .lean();

    const paymentsByProject = payments.reduce((acc, payment) => {
      const projectId = String(payment.project?._id || payment.project);
      if (!acc[projectId]) {
        acc[projectId] = [];
      }
      acc[projectId].push(payment);
      return acc;
    }, {});

    const projectPayments = projects.map((project) => {
      const entries = (paymentsByProject[String(project._id)] || []).map(
        (payment) => ({
          _id: payment._id,
          amount: Number(payment.amount) || 0,
          method: payment.method || "",
          paymentType: payment.paymentType || "project-payment",
          status: payment.status || "paid",
          invoiceNo: payment.invoiceNo || "",
          paymentDate: payment.paymentDate || payment.createdAt,
          notes: payment.notes || "",
          createdAt: payment.createdAt,
        })
      );

      return {
        project: {
          _id: project._id,
          projectId: project.projectId,
          name: project.name,
          totalPayment: Number(project.totalPayment) || 0,
        },
        summary: calculateProjectPaymentSummary(project, entries),
        payments: entries,
      };
    });

    const overallSummary = projectPayments.reduce(
      (acc, item) => {
        acc.totalPayment += item.summary.totalPayment;
        acc.paidAmount += item.summary.paidAmount;
        acc.pendingAmount += item.summary.pendingAmount;
        acc.failedAmount += item.summary.failedAmount;
        acc.dueAmount += item.summary.dueAmount;
        acc.paymentCount += item.summary.paymentCount;
        return acc;
      },
      {
        totalPayment: 0,
        paidAmount: 0,
        pendingAmount: 0,
        failedAmount: 0,
        dueAmount: 0,
        paymentCount: 0,
      }
    );

    res.json({
      success: true,
      payments,
      projectPayments,
      summary: overallSummary,
    });
  } catch (err) {
    logger.error({ err: err }, "Client payments error");
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

export const getPaymentsForProject = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const project = await ERPProject.findOne({
      _id: req.params.projectId,
      client: client._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const payments = await ERPPayment.find({ project: project._id }).sort({
      paymentDate: -1,
      createdAt: -1,
    }).lean();

    const normalizedPayments = payments.map((payment) => ({
      transactionReference: payment.transactionReference || "",
      instalmentId: payment.instalmentId || "",
      instalmentLabel: payment.instalmentLabel || "",
      _id: payment._id,
      amount: Number(payment.amount) || 0,
      method: payment.method || "",
      paymentType: payment.paymentType || "project-payment",
      status: payment.status || "paid",
      invoiceNo: payment.invoiceNo || "",
      paymentDate: payment.paymentDate || payment.createdAt,
      notes: payment.notes || "",
      createdAt: payment.createdAt,
    }));

    res.json({
      success: true,
      project: {
        _id: project._id,
        projectId: project.projectId,
        name: project.name,
        totalPayment: Number(project.totalPayment) || 0,
      },
      summary: calculateProjectPaymentSummary(project, normalizedPayments),
      payments: normalizedPayments,
    });
  } catch (err) {
    logger.error({ err: err }, "Client project payments error");
    res.status(500).json({ message: "Failed to fetch project payments" });
  }
};

export const getProjectHistory = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const projects = await getClientProjects(client._id);

    const history = projects.map((project, index) => ({
      id: project._id,
      serial: index + 1,
      project: project.name,
      projectId: project.projectId,
      activity:
        project.projectDetails ||
        `Project is currently ${project.status || "pending"} with ${
          project.progress || 0
        }% progress`,
      date: project.expectedDelivery || project.createdAt,
      status: project.status || "pending",
      progress: project.progress || 0,
    }));

    res.json({
      success: true,
      history,
    });
  } catch (err) {
    logger.error({ err: err }, "Client project history error");
    res.status(500).json({ message: "Failed to fetch project history" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    res.json({
      _id: client._id,
      name: client.name,
      email: client.email,
      company: client.company || "",
      clientId: client.clientId || "",
      phone: client.phone || "",
      address: client.address || "",
      status: client.status,
      createdAt: client.createdAt,
    });
  } catch (err) {
    logger.error({ err: err }, "Client profile error");
    res.status(500).json({ message: "Failed to fetch client profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const { phone, address, company } = req.body || {};

    if (phone !== undefined) client.phone = String(phone).trim();
    if (address !== undefined) client.address = String(address).trim();
    if (company !== undefined) client.company = String(company).trim();

    await client.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        _id: client._id,
        name: client.name,
        email: client.email,
        company: client.company || "",
        clientId: client.clientId || "",
        phone: client.phone || "",
        address: client.address || "",
        status: client.status,
        createdAt: client.createdAt,
      },
    });
  } catch (err) {
    logger.error({ err: err }, "Client profile update error");
    res.status(500).json({ message: "Failed to update client profile" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const client = await findClientOrFail(req, res);
    if (!client) return;

    const { toEmail, text, roleTo } = req.body || {};

    if (!toEmail || !text) {
      return res.status(400).json({
        message: "toEmail and text are required",
      });
    }

    const project = await ERPProject.findOne({
      _id: req.params.projectId,
      client: client._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const message = await ERPMessage.create({
      project: project._id,
      fromEmail: client.email,
      toEmail: String(toEmail).toLowerCase(),
      roleFrom: "client",
      roleTo: roleTo || "manager",
      text: String(text).trim(),
    });

    res.json({
      success: true,
      message,
    });
  } catch (err) {
    logger.error({ err: err }, "Client send message error");
    res.status(500).json({ message: "Failed to send message" });
  }
};
