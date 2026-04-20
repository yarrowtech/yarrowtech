import ERPUser from "../models/User.js";
import ProductUserPayment from "../models/ProductUserPayment.js";
import ERPMessage from "../models/Message.js";

const PRODUCT_ROLE = "productuser";
const PAYMENT_STATUSES = ["paid", "pending", "failed"];

const normalizeMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const normalizePaymentStatus = (value = "paid") => {
  const status = String(value || "paid").toLowerCase();
  return PAYMENT_STATUSES.includes(status) ? status : "paid";
};

const buildManagerAccessQuery = (req) => {
  const managerId = req.erpUser?._id || req.erpUser?.id;
  const managerEmail = String(req.erpUser?.email || "").toLowerCase();

  const or = [];
  if (managerId) {
    or.push({ manager: managerId });
  }
  if (managerEmail) {
    or.push({ managerEmail });
  }

  return or.length ? { $or: or } : null;
};

async function getAccessibleProductUser(req, productUserId) {
  if (!productUserId) return null;

  if (req.erpUser?.role === "admin") {
    return ERPUser.findOne({
      _id: productUserId,
      role: PRODUCT_ROLE,
    }).populate("manager", "name email");
  }

  if (req.erpUser?.role === PRODUCT_ROLE) {
    return ERPUser.findOne({
      _id: productUserId,
      role: PRODUCT_ROLE,
      email: String(req.erpUser?.email || "").toLowerCase(),
    }).populate("manager", "name email");
  }

  if (req.erpUser?.role === "manager") {
    const managerAccess = buildManagerAccessQuery(req);
    if (!managerAccess) return null;

    return ERPUser.findOne({
      _id: productUserId,
      role: PRODUCT_ROLE,
      ...managerAccess,
    }).populate("manager", "name email");
  }

  return null;
}

async function buildProductUserDetails(productUser) {
  const payments = await ProductUserPayment.find({
    productUser: productUser._id,
  })
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();

  const normalizedPayments = payments.map((payment) => ({
    _id: payment._id,
    amount: Number(payment.amount) || 0,
    method: payment.method || "",
    status: normalizePaymentStatus(payment.status),
    paymentDate: payment.paymentDate || payment.createdAt,
    invoiceNo: payment.invoiceNo || "",
    notes: payment.notes || "",
    createdAt: payment.createdAt,
  }));

  const summary = normalizedPayments.reduce(
    (acc, payment) => {
      acc.total += payment.amount;
      if (payment.status === "paid") acc.paid += payment.amount;
      if (payment.status === "pending") acc.pending += payment.amount;
      if (payment.status === "failed") acc.failed += payment.amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0, failed: 0, count: normalizedPayments.length }
  );

  const totalAmount = Number(productUser.totalAmount) || 0;
  summary.totalAmount = totalAmount;
  summary.dueAmount = Math.max(totalAmount - summary.paid, 0);

  return {
    productUser: {
      _id: productUser._id,
      name: productUser.name || "",
      email: productUser.email,
      role: productUser.role,
      status: productUser.status,
      address: productUser.address || "",
      mobileNumber: productUser.mobileNumber || "",
      productName: productUser.productName || "",
      totalAmount,
      manager: productUser.manager
        ? {
            _id: productUser.manager._id,
            name: productUser.manager.name || "",
            email: productUser.manager.email || "",
          }
        : null,
      managerEmail:
        productUser.managerEmail ||
        productUser.manager?.email ||
        "",
      assignedAt: productUser.assignedAt || productUser.createdAt,
      createdAt: productUser.createdAt,
    },
    paymentSummary: summary,
    paymentHistory: normalizedPayments,
  };
}

export const getProductCatalog = async (req, res) => {
  res.json({
    success: true,
    products: [
      "EEC - Electronic Educare",
      "RMS - Retail Management System",
      "F&B - Food & Beverage Management System",
      "SportBit - Sports Management System",
    ],
  });
};

export const getManagersForAssignment = async (req, res) => {
  try {
    const managers = await ERPUser.find(
      { role: "manager", status: "active" },
      { name: 1, email: 1 }
    ).sort({ createdAt: -1 });

    res.json({ success: true, managers });
  } catch (err) {
    console.error("GET MANAGERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};

export const updateProductUserPaymentSummary = async (req, res) => {
  try {
    const productUser = await getAccessibleProductUser(req, req.params.id);
    if (!productUser) {
      return res.status(404).json({ message: "Product user not found" });
    }

    const totalAmount = normalizeMoney(req.body?.totalAmount);
    if (totalAmount == null) {
      return res.status(400).json({ message: "Valid total amount is required" });
    }

    await ERPUser.findByIdAndUpdate(productUser._id, { totalAmount });
    const refreshed = await getAccessibleProductUser(req, req.params.id);

    res.json({
      success: true,
      message: "Product user total amount updated successfully",
      ...(await buildProductUserDetails(refreshed)),
    });
  } catch (err) {
    console.error("UPDATE PRODUCT USER PAYMENT SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to update total amount" });
  }
};

export const getProductUsers = async (req, res) => {
  try {
    const query = { role: PRODUCT_ROLE };

    if (req.erpUser?.role === "manager") {
      const managerAccess = buildManagerAccessQuery(req);
      if (!managerAccess) {
        return res.json({ success: true, productUsers: [] });
      }
      Object.assign(query, managerAccess);
    }

    const productUsers = await ERPUser.find(query)
      .populate("manager", "name email")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      productUsers,
    });
  } catch (err) {
    console.error("GET PRODUCT USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product users" });
  }
};

export const getProductUserAnalytics = async (req, res) => {
  try {
    const query = { role: PRODUCT_ROLE };

    if (req.erpUser?.role === "manager") {
      const managerAccess = buildManagerAccessQuery(req);
      if (!managerAccess) {
        return res.json({
          success: true,
          summary: {
            totalUsers: 0,
            activeUsers: 0,
            totalPaid: 0,
            totalPending: 0,
            totalFailed: 0,
          },
          productWisePayments: [],
          monthWisePayments: [],
        });
      }
      Object.assign(query, managerAccess);
    }

    const productUsers = await ERPUser.find(query)
      .select("_id status productName")
      .lean();

    const ids = productUsers.map((item) => item._id);
    const payments = ids.length
      ? await ProductUserPayment.find({ productUser: { $in: ids } }).lean()
      : [];

    const productUserById = productUsers.reduce((acc, item) => {
      acc[String(item._id)] = item;
      return acc;
    }, {});

    const productWiseMap = new Map();
    const statusMap = new Map([
      ["paid", 0],
      ["pending", 0],
      ["failed", 0],
    ]);
    const monthWiseMap = new Map();

    let totalPaid = 0;
    let totalPending = 0;
    let totalFailed = 0;

    payments.forEach((payment) => {
      const owner = productUserById[String(payment.productUser)];
      const productName = owner?.productName || "Unassigned Product";
      const normalizedStatus = normalizePaymentStatus(payment.status);
      const amount = Number(payment.amount) || 0;

      if (!productWiseMap.has(productName)) {
        productWiseMap.set(productName, {
          productName,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          failedAmount: 0,
          paymentCount: 0,
        });
      }

      const bucket = productWiseMap.get(productName);
      bucket.totalAmount += amount;
      bucket.paymentCount += 1;

      if (normalizedStatus === "paid") {
        bucket.paidAmount += amount;
        totalPaid += amount;
      }

      if (normalizedStatus === "pending") {
        bucket.pendingAmount += amount;
        totalPending += amount;
      }

      if (normalizedStatus === "failed") {
        bucket.failedAmount += amount;
        totalFailed += amount;
      }

      statusMap.set(normalizedStatus, (statusMap.get(normalizedStatus) || 0) + amount);

      const paymentDate = new Date(payment.paymentDate || payment.createdAt || Date.now());
      const monthKey = paymentDate.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthWiseMap.has(monthKey)) {
        monthWiseMap.set(monthKey, {
          month: monthKey,
          paidAmount: 0,
          pendingAmount: 0,
          failedAmount: 0,
          totalAmount: 0,
        });
      }

      const monthBucket = monthWiseMap.get(monthKey);
      monthBucket.totalAmount += amount;

      if (normalizedStatus === "paid") monthBucket.paidAmount += amount;
      if (normalizedStatus === "pending") monthBucket.pendingAmount += amount;
      if (normalizedStatus === "failed") monthBucket.failedAmount += amount;
    });

    res.json({
      success: true,
      summary: {
        totalUsers: productUsers.length,
        activeUsers: productUsers.filter((item) => item.status === "active").length,
        totalPaid,
        totalPending,
        totalFailed,
      },
      productWisePayments: Array.from(productWiseMap.values()).sort(
        (a, b) => b.totalAmount - a.totalAmount
      ),
      monthWisePayments: Array.from(monthWiseMap.values()).sort(
        (a, b) => new Date(`1 ${a.month}`) - new Date(`1 ${b.month}`)
      ),
    });
  } catch (err) {
    console.error("GET PRODUCT USER ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product user analytics" });
  }
};

export const getProductUserDetails = async (req, res) => {
  try {
    const productUser = await getAccessibleProductUser(req, req.params.id);
    if (!productUser) {
      return res.status(404).json({ message: "Product user not found" });
    }

    res.json({
      success: true,
      ...(await buildProductUserDetails(productUser)),
    });
  } catch (err) {
    console.error("GET PRODUCT USER DETAILS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product user details" });
  }
};

export const addProductUserPayment = async (req, res) => {
  try {
    const productUser = await getAccessibleProductUser(req, req.params.id);
    if (!productUser) {
      return res.status(404).json({ message: "Product user not found" });
    }

    const amount = normalizeMoney(req.body?.amount);
    if (amount == null) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const method = String(req.body?.method || "").trim();
    if (!method) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    await ProductUserPayment.create({
      productUser: productUser._id,
      amount,
      method,
      status: normalizePaymentStatus(req.body?.status),
      paymentDate: req.body?.paymentDate || new Date(),
      invoiceNo: String(req.body?.invoiceNo || `PU-INV-${Date.now()}`).trim(),
      notes: String(req.body?.notes || "").trim(),
    });

    const refreshed = await getAccessibleProductUser(req, req.params.id);

    res.status(201).json({
      success: true,
      message: "Payment entry added successfully",
      ...(await buildProductUserDetails(refreshed)),
    });
  } catch (err) {
    console.error("ADD PRODUCT USER PAYMENT ERROR:", err);
    res.status(500).json({ message: "Failed to add payment entry" });
  }
};

export const getMyDashboard = async (req, res) => {
  try {
    const productUser = await ERPUser.findOne({
      _id: req.erpUser?._id || req.erpUser?.id,
      role: PRODUCT_ROLE,
    }).populate("manager", "name email");

    if (!productUser) {
      return res.status(404).json({ message: "Product user not found" });
    }

    const detailPayload = await buildProductUserDetails(productUser);
    const recentMessages = await ERPMessage.find({
      productUser: productUser._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      stats: {
        productName: detailPayload.productUser.productName,
        managerName:
          detailPayload.productUser.manager?.name ||
          detailPayload.productUser.managerEmail ||
          "-",
        totalPayments: detailPayload.paymentSummary.totalAmount,
        paidPayments: detailPayload.paymentSummary.paid,
        dueAmount: detailPayload.paymentSummary.dueAmount,
        totalMessages: recentMessages.length,
      },
      details: detailPayload.productUser,
      paymentSummary: detailPayload.paymentSummary,
      recentMessages,
    });
  } catch (err) {
    console.error("PRODUCT USER DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
};

export const getMyProjectDetails = async (req, res) => {
  try {
    const productUser = await getAccessibleProductUser(
      req,
      req.erpUser?._id || req.erpUser?.id
    );

    if (!productUser) {
      return res.status(404).json({ message: "Product user details not found" });
    }

    res.json({
      success: true,
      ...(await buildProductUserDetails(productUser)),
    });
  } catch (err) {
    console.error("PRODUCT USER PROJECT DETAILS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const productUser = await getAccessibleProductUser(
      req,
      req.erpUser?._id || req.erpUser?.id
    );

    if (!productUser) {
      return res.status(404).json({ message: "Product user not found" });
    }

    const details = await buildProductUserDetails(productUser);
    res.json({
      success: true,
      paymentSummary: details.paymentSummary,
      paymentHistory: details.paymentHistory,
    });
  } catch (err) {
    console.error("PRODUCT USER PAYMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};
