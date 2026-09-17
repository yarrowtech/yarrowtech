import EfnbmmsSubscription from "../models/EfnbmmsSubscription.js";
import EfnbmmsVendorSubscription from "../models/EfnbmmsVendorSubscription.js";
import {
  createEfnbmmsSignupOrder,
  createEfnbmmsVendorSignup,
  createEfnbmmsVendorSubscriptionOrder,
  getEfnbmmsPlans,
  getEfnbmmsVendorPlans,
  loginEfnbmmsVendor,
  verifyEfnbmmsSignupPayment,
  verifyEfnbmmsVendorSubscriptionPayment,
} from "../utils/efnbmmsClient.js";
import {
  EFNBMMS_ADMIN_PRODUCT_NAME,
  EFNBMMS_VENDOR_PRODUCT_NAME,
  recordEfnbmmsProductUserPayment,
  syncEfnbmmsProductUser,
} from "../utils/efnbmmsProductUserSync.js";

/* -------------------------------------------------------
   GET PLANS  (GET /api/efnbmms/plans)
   Public — just relays EFNBMMS's plan list so the
   Yarrowtech website can render pricing without the
   browser ever calling EFNBMMS directly.
------------------------------------------------------- */
export const getPlans = async (req, res) => {
  try {
    const data = await getEfnbmmsPlans();
    return res.status(200).json(data);
  } catch (error) {
    console.error("EFNBMMS getPlans error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not load EFNBMMS plans",
    });
  }
};

/* -------------------------------------------------------
   CREATE SIGNUP ORDER  (POST /api/efnbmms/signup/order)
   Body: businessName, email, mobile, address, panNumber,
         gstNumber, password, planCode, billingCycle
------------------------------------------------------- */
export const createSignupOrder = async (req, res) => {
  try {
    const data = await createEfnbmmsSignupOrder(req.body);

    if (data?.order?.id) {
      await EfnbmmsSubscription.create({
        businessName: req.body.businessName,
        email: req.body.email,
        mobile: req.body.mobile,
        planCode: req.body.planCode,
        billingCycle: req.body.billingCycle,
        amount: data.order.amount ? data.order.amount / 100 : 0,
        razorpayOrderId: data.order.id,
        status: "created",
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("EFNBMMS createSignupOrder error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not start EFNBMMS signup",
    });
  }
};

/* -------------------------------------------------------
   VERIFY SIGNUP PAYMENT  (POST /api/efnbmms/signup/verify)
   Body: razorpay_order_id, razorpay_payment_id, razorpay_signature
------------------------------------------------------- */
export const verifySignupPayment = async (req, res) => {
  const razorpayOrderId = String(req.body.razorpay_order_id || "").trim();

  try {
    const data = await verifyEfnbmmsSignupPayment(req.body);

    let localSubscription = null;
    if (razorpayOrderId) {
      localSubscription = await EfnbmmsSubscription.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            status: "verified",
            razorpayPaymentId: req.body.razorpay_payment_id || "",
            efnbmmsAdminId: data?.admin?.adminId || "",
          },
        },
        { new: true }
      );
    }

    // Mirror into Yarrowtech's own ERP "Product Users" list. Requires the
    // plaintext password again since the local tracking record above never
    // stores it — the frontend resends it here from the same signup form.
    await syncEfnbmmsProductUser({
      name: req.body.businessName,
      email: req.body.email,
      password: req.body.password,
      mobileNumber: req.body.mobile,
      address: req.body.address,
      amountPaid: localSubscription?.amount || 0,
      productName: EFNBMMS_ADMIN_PRODUCT_NAME,
    });

    return res.status(201).json(data);
  } catch (error) {
    console.error("EFNBMMS verifySignupPayment error:", error.message);

    if (razorpayOrderId) {
      await EfnbmmsSubscription.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            status: "failed",
            failureReason: error.data?.message || error.message,
          },
        }
      ).catch(() => {});
    }

    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not verify EFNBMMS payment",
    });
  }
};

/* =========================================================
   VENDOR SIDE
   EFNBMMS creates the vendor account for free first, then
   requires a logged-in vendor (JWT) to pick and pay for a
   subscription plan — so this flow is signup -> login ->
   order -> verify, unlike the admin's combined signup+pay.
========================================================= */

/* -------------------------------------------------------
   GET VENDOR PLANS  (GET /api/efnbmms/vendor/plans)
------------------------------------------------------- */
export const getVendorPlans = async (req, res) => {
  try {
    const data = await getEfnbmmsVendorPlans();
    return res.status(200).json(data);
  } catch (error) {
    console.error("EFNBMMS getVendorPlans error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not load EFNBMMS vendor plans",
    });
  }
};

/* -------------------------------------------------------
   VENDOR SELF SIGNUP  (POST /api/efnbmms/vendor/signup)
   Free account creation, no payment yet.
   Body: name, email, phone, address, governmentId,
         governmentIdType, category, password
------------------------------------------------------- */
export const vendorSignup = async (req, res) => {
  try {
    const data = await createEfnbmmsVendorSignup(req.body);

    // Mirror into Yarrowtech's own ERP "Product Users" list right away —
    // vendor accounts exist before any plan/payment, unlike admin signup.
    await syncEfnbmmsProductUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      mobileNumber: req.body.phone,
      address: req.body.address,
      amountPaid: 0,
      productName: EFNBMMS_VENDOR_PRODUCT_NAME,
    });

    return res.status(201).json(data);
  } catch (error) {
    console.error("EFNBMMS vendorSignup error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not create EFNBMMS vendor account",
    });
  }
};

/* -------------------------------------------------------
   VENDOR LOGIN  (POST /api/efnbmms/vendor/login)
   Body: email or vendorId, password.
   Returns EFNBMMS's own vendor JWT — the frontend holds it
   only long enough to finish plan selection/payment; it is
   not this site's own auth token.
------------------------------------------------------- */
export const vendorLogin = async (req, res) => {
  try {
    const data = await loginEfnbmmsVendor(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error("EFNBMMS vendorLogin error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not log in to EFNBMMS",
    });
  }
};

const extractVendorToken = (req) => {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

/* -------------------------------------------------------
   CREATE VENDOR SUBSCRIPTION ORDER
   (POST /api/efnbmms/vendor/subscription/order)
   Requires the vendor's EFNBMMS token in the Authorization
   header (from vendorLogin). Body: planCode
------------------------------------------------------- */
export const createVendorSubscriptionOrder = async (req, res) => {
  const vendorToken = extractVendorToken(req);
  if (!vendorToken) {
    return res.status(401).json({ success: false, message: "Vendor login required" });
  }

  try {
    const data = await createEfnbmmsVendorSubscriptionOrder(req.body, vendorToken);

    if (data?.order?.id) {
      await EfnbmmsVendorSubscription.create({
        name: req.body.name || "",
        email: req.body.email || "",
        mobile: req.body.mobile || "",
        panNumber: req.body.panNumber || "",
        planCode: req.body.planCode,
        amount: data.order.amount ? data.order.amount / 100 : 0,
        razorpayOrderId: data.order.id,
        status: "created",
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("EFNBMMS createVendorSubscriptionOrder error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not start EFNBMMS vendor subscription",
    });
  }
};

/* -------------------------------------------------------
   VERIFY VENDOR SUBSCRIPTION PAYMENT
   (POST /api/efnbmms/vendor/subscription/verify)
   Requires the vendor's EFNBMMS token in the Authorization
   header. Body: razorpay_order_id, razorpay_payment_id,
   razorpay_signature
------------------------------------------------------- */
export const verifyVendorSubscriptionPayment = async (req, res) => {
  const vendorToken = extractVendorToken(req);
  if (!vendorToken) {
    return res.status(401).json({ success: false, message: "Vendor login required" });
  }

  const razorpayOrderId = String(req.body.razorpay_order_id || "").trim();

  try {
    const data = await verifyEfnbmmsVendorSubscriptionPayment(req.body, vendorToken);

    let localSubscription = null;
    if (razorpayOrderId) {
      localSubscription = await EfnbmmsVendorSubscription.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            status: "verified",
            razorpayPaymentId: req.body.razorpay_payment_id || "",
            efnbmmsVendorId: data?.vendor?.vendorId || "",
          },
        },
        { new: true }
      );
    }

    // Log the payment against the product-user record created at signup.
    // Uses the email captured on the local order record (not req.body,
    // which this endpoint never receives it in) as the source of truth.
    await recordEfnbmmsProductUserPayment({
      email: localSubscription?.email,
      amount: localSubscription?.amount || 0,
      razorpayPaymentId: req.body.razorpay_payment_id,
      notes: "EFNBMMS vendor plan activation",
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("EFNBMMS verifyVendorSubscriptionPayment error:", error.message);

    if (razorpayOrderId) {
      await EfnbmmsVendorSubscription.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            status: "failed",
            failureReason: error.data?.message || error.message,
          },
        }
      ).catch(() => {});
    }

    return res.status(error.status || 500).json({
      success: false,
      message: error.data?.message || "Could not verify EFNBMMS vendor payment",
    });
  }
};
