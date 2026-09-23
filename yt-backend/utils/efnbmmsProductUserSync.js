/* -------------------------------------------------------
   Mirrors a completed EFNBMMS self-signup into Yarrowtech's
   own ERP "Product Users" list, so admins/managers here can
   see and manage EFNBMMS subscribers the same way they see
   manually-created ones (e.g. the existing "sj" / F&B entry).
------------------------------------------------------- */
import ERPUser from "../erp/models/User.js";
import ERPProductUserPayment from "../erp/models/ProductUserPayment.js";
import logger from "./logger.js";

export const EFNBMMS_ADMIN_PRODUCT_NAME = "F&B - Food & Beverage Management System";
export const EFNBMMS_VENDOR_PRODUCT_NAME =
  "F&B - Food & Beverage Management System (Vendor)";

const joinAddress = (address = {}) => {
  if (typeof address === "string") return address;

  const lines = [address.line1, address.line2, address.landmark, address.city, address.state]
    .filter(Boolean)
    .join(", ");
  const pincode = address.pincode ? ` - ${address.pincode}` : "";
  const country = address.country ? `, ${address.country}` : "";
  return `${lines}${pincode}${country}`;
};

// Reuses whichever manager already owns existing product-user records for
// this same product, instead of a hardcoded default, so EFNBMMS self-signups
// land with the same manager as manually-created customers of that product.
const resolveManagerForProduct = async (productName) => {
  const existing = await ERPUser.findOne({
    role: "productuser",
    productName,
    manager: { $ne: null },
  })
    .sort({ createdAt: -1 })
    .select("manager managerEmail");

  if (existing?.manager) {
    return { managerId: existing.manager, managerEmail: existing.managerEmail };
  }

  const fallbackManager = await ERPUser.findOne({
    role: "manager",
    status: "active",
  }).sort({ createdAt: 1 });

  return fallbackManager
    ? { managerId: fallbackManager._id, managerEmail: fallbackManager.email }
    : null;
};

/* Creates the ERP "product user" record. Called once, right when the
   EFNBMMS account itself is confirmed (admin: after payment verification;
   vendor: at free signup, since vendor accounts exist before any plan is
   chosen). Silently no-ops on conflicts/config gaps — this is a secondary
   CRM mirror and must never break the customer-facing signup flow. */
export const syncEfnbmmsProductUser = async ({
  name,
  email,
  password,
  mobileNumber,
  address,
  amountPaid = 0,
  productName,
}) => {
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) return;

    const existing = await ERPUser.findOne({ email: normalizedEmail });
    if (existing) {
      logger.warn(
        { email: normalizedEmail, role: existing.role },
        "EFNBMMS product-user sync skipped: user already exists in ERP"
      );
      return;
    }

    const managerInfo = await resolveManagerForProduct(productName);
    if (!managerInfo) {
      logger.warn("EFNBMMS product-user sync skipped: no active manager available to assign");
      return;
    }

    const productUser = await ERPUser.create({
      name: String(name || "").trim(),
      email: normalizedEmail,
      password,
      role: "productuser",
      status: "active",
      billingSource: "efnbmms",
      address: joinAddress(address),
      mobileNumber: String(mobileNumber || "").trim(),
      manager: managerInfo.managerId,
      managerEmail: managerInfo.managerEmail,
      productName,
      assignedAt: new Date(),
      totalAmount: Number(amountPaid || 0),
    });

    if (Number(amountPaid) > 0) {
      await ERPProductUserPayment.create({
        productUser: productUser._id,
        amount: Number(amountPaid),
        method: "Razorpay",
        status: "paid",
        notes: "EFNBMMS subscription signup",
      });
    }
  } catch (error) {
    logger.error({ err: error }, "EFNBMMS product-user sync failed");
  }
};

/* Logs a later plan payment (vendor's paid plan, chosen after their free
   signup already mirrored a product user) against the existing record. */
export const recordEfnbmmsProductUserPayment = async ({
  email,
  amount,
  razorpayPaymentId,
  notes,
}) => {
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !(Number(amount) > 0)) return;

    const productUser = await ERPUser.findOne({
      email: normalizedEmail,
      role: "productuser",
    });
    if (!productUser) return;

    productUser.totalAmount = Number(productUser.totalAmount || 0) + Number(amount);
    await productUser.save();

    await ERPProductUserPayment.create({
      productUser: productUser._id,
      amount: Number(amount),
      method: "Razorpay",
      status: "paid",
      invoiceNo: razorpayPaymentId || "",
      notes: notes || "",
    });
  } catch (error) {
    logger.error({ err: error }, "EFNBMMS product-user payment sync failed");
  }
};
