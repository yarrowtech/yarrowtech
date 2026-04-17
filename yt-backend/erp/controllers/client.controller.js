import ERPClient from "../models/Client.js";
import ERPMessage from "../models/Message.js";
import ERPPayment from "../models/Payment.js";
import ERPProject from "../models/Project.js";
import { calculateProjectPaymentSummary } from "../utils/paymentSummary.js";

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
    console.error("CLIENT PROJECTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch client projects" });
  }
};

export const getClientDashboard = async (req, res) => {
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
    console.error("CLIENT DASHBOARD ERROR:", err);
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
    console.error("CLIENT PAYMENTS ERROR:", err);
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
    console.error("CLIENT PROJECT PAYMENTS ERROR:", err);
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
    console.error("CLIENT PROJECT HISTORY ERROR:", err);
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
    console.error("CLIENT PROFILE ERROR:", err);
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
    console.error("CLIENT PROFILE UPDATE ERROR:", err);
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
    console.error("CLIENT SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
