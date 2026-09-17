import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import API from "../services/api";
import PasswordField from "../components/PasswordField";
import LegalDocumentStep from "../components/LegalDocumentStep";
import "./EfnbmmsSignupPage.css";

const PRODUCT_SLUG = "food-and-beverage-management-system";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  panNumber: "",
  gstNumber: "",
  category: "",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function EfnbmmsVendorSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  // "form" -> "terms" -> "privacy" -> (signup+payment kicks off on privacy agree)
  const [flowStep, setFlowStep] = useState("form");

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanCode, setSelectedPlanCode] = useState("");

  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;

    API.get("/efnbmms/vendor/plans")
      .then(({ data }) => {
        if (!active) return;
        const list = data?.plans || [];
        setPlans(list);
        const preferred = list.find((p) => p.isPopular) || list[0];
        if (preferred) setSelectedPlanCode(preferred.code);
      })
      .catch(() => {
        toast.error("Could not load EFNBMMS vendor plans. Please try again later.");
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode) || null,
    [plans, selectedPlanCode]
  );

  const UPPERCASE_FIELDS = ["panNumber", "gstNumber"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = UPPERCASE_FIELDS.includes(name) ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const validateSignup = () => {
    if (!selectedPlan) return "Choose a vendor plan to continue";
    if (!form.name.trim()) return "Vendor / business name is required";
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim()))
      return "Enter a valid email address";
    if (!form.phone.trim()) return "Phone number is required";
    if (
      !form.addressLine1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    )
      return "Address line 1, city, state, and PIN code are required";
    if (!form.panNumber.trim()) return "PAN number is required";
    if (!GST_REGEX.test(form.gstNumber.trim().toUpperCase()))
      return "Enter a valid GST number";
    if (!PASSWORD_REGEX.test(form.password))
      return "Password must be 8+ characters with an uppercase letter, lowercase letter, number, and special character";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleContinueToTerms = (e) => {
    e.preventDefault();
    if (submitting) return;

    const error = validateSignup();
    if (error) return toast.error(error);

    setFlowStep("terms");
  };

  // Runs after the free vendor account exists and we're logged in with its
  // token — activates the plan the vendor already picked above the form.
  // EFNBMMS's vendor record only stores one government ID (used for GST
  // above), so PAN/name/email/mobile are forwarded here purely for our own
  // local tracking (EFNBMMS itself only needs planCode).
  const activateSelectedPlan = async (vendorToken, vendorInfo) => {
    const { data } = await API.post(
      "/efnbmms/vendor/subscription/order",
      {
        planCode: selectedPlan.code,
        panNumber: form.panNumber.trim().toUpperCase(),
        name: vendorInfo?.name,
        email: vendorInfo?.email,
        mobile: form.phone.trim(),
      },
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );

    if (data?.freeActivation) {
      setSuccessInfo({
        vendorId: vendorInfo?.vendorId,
        name: vendorInfo?.name,
        email: vendorInfo?.email,
        credentialsEmailSent: Boolean(vendorInfo?.credentialsEmailSent),
      });
      toast.success(data.message || "Plan activated!");
      return;
    }

    const order = data?.order;
    const keyId = data?.keyId;

    if (!order?.id || !keyId) {
      throw new Error("Could not start payment. Please try again.");
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Could not load Razorpay checkout. Check your connection.");
    }

    await new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "EFNBMMS Vendor",
        description: `${selectedPlan.name} — vendor plan`,
        prefill: {
          name: vendorInfo?.name,
          email: vendorInfo?.email,
        },
        theme: { color: "#16a34a" },
        handler: async (response) => {
          try {
            const verify = await API.post(
              "/efnbmms/vendor/subscription/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${vendorToken}` } }
            );

            setSuccessInfo({
              vendorId: verify.data?.vendor?.vendorId || vendorInfo?.vendorId,
              name: vendorInfo?.name,
              email: vendorInfo?.email,
              credentialsEmailSent: Boolean(vendorInfo?.credentialsEmailSent),
            });
            toast.success("Vendor subscription activated!");
            resolve();
          } catch (verifyError) {
            reject(
              new Error(
                verifyError.response?.data?.message ||
                  "Payment received but verification failed. Contact support."
              )
            );
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });

      razorpay.on("payment.failed", () => {
        reject(new Error("Payment failed. Please try again."));
      });

      razorpay.open();
    });
  };

  const startSignup = async () => {
    if (submitting) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: {
        line1: form.addressLine1.trim(),
        line2: form.addressLine2.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: "India",
      },
      governmentId: form.gstNumber.trim().toUpperCase(),
      governmentIdType: "GST",
      category: form.category.trim(),
      password: form.password,
    };

    try {
      setSubmitting(true);

      setSubmitStage("Creating your vendor account…");
      const signup = await API.post("/efnbmms/vendor/signup", payload);
      const vendorInfo = signup.data?.vendor
        ? {
            ...signup.data.vendor,
            credentialsEmailSent: Boolean(signup.data.credentialsEmailSent),
          }
        : null;

      setSubmitStage("Logging you in…");
      const login = await API.post("/efnbmms/vendor/login", {
        email: payload.email,
        password: payload.password,
      });
      const vendorToken = login.data?.token || "";
      if (!vendorToken) throw new Error("Could not sign in to activate your plan");

      setSubmitStage(
        selectedPlan.monthlyPrice > 0 ? "Opening secure payment…" : "Activating your plan…"
      );
      await activateSelectedPlan(vendorToken, vendorInfo);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Could not complete vendor signup"
      );
      setFlowStep("form");
    } finally {
      setSubmitting(false);
      setSubmitStage("");
    }
  };

  if (flowStep === "terms" || flowStep === "privacy") {
    const isTerms = flowStep === "terms";
    return (
      <LegalDocumentStep
        productSlug={PRODUCT_SLUG}
        docType={isTerms ? "terms" : "privacy"}
        stepLabel={isTerms ? "Step 2 of 3" : "Step 3 of 3"}
        onAgree={() => {
          if (isTerms) {
            setFlowStep("privacy");
          } else {
            setFlowStep("payment");
            startSignup();
          }
        }}
        onDisagree={() => {
          toast.error(
            `You must agree to the ${
              isTerms ? "Terms & Conditions" : "Privacy Policy"
            } to subscribe`
          );
          setFlowStep("form");
        }}
      />
    );
  }

  if (flowStep === "payment" && !successInfo) {
    return (
      <main className="efnbmms-signup-page">
        <div className="efnbmms-success-card">
          <p>{submitStage || "Processing…"}</p>
        </div>
      </main>
    );
  }

  if (successInfo) {
    return (
      <main className="efnbmms-signup-page">
        <div className="efnbmms-success-card">
          <CheckCircle2 size={52} className="efnbmms-success-icon" aria-hidden="true" />
          <h1>Welcome, {successInfo.name}!</h1>
          <p>
            Your EFNBMMS vendor account (<strong>{successInfo.vendorId}</strong>) is ready
            and your subscription is active.{" "}
            {successInfo.credentialsEmailSent ? (
              <>
                We've sent your login credentials to <strong>{successInfo.email}</strong>.
              </>
            ) : (
              <>
                We couldn't email your credentials automatically, so use the email and
                password you just set (<strong>{successInfo.email}</strong>) to log in.
              </>
            )}
          </p>
          <a
            className="efnbmms-primary-btn"
            href="https://www.efnbmms.com/"
            target="_blank"
            rel="noreferrer"
          >
            Go to EFNBMMS Login
          </a>
          <button
            type="button"
            className="efnbmms-back-link"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="efnbmms-signup-page">
      <div className="efnbmms-signup-shell">
        <Link
          to="/products/food-and-beverage-management-system"
          className="efnbmms-back-link"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to EFNBMMS overview
        </Link>

        <header className="efnbmms-signup-header">
          <span className="efnbmms-eyebrow">EFNBMMS Vendor Subscription — Step 1 of 3</span>
          <h1>Sign up and subscribe as an EFNBMMS vendor</h1>
          <p>
            Choose a vendor plan and tell us about your business. You'll review the Terms
            &amp; Conditions and Privacy Policy next, then activate your account.
          </p>
        </header>

        {plansLoading ? (
          <p className="efnbmms-loading">Loading plans…</p>
        ) : (
          <section className="efnbmms-plan-grid">
            {plans.map((plan) => {
              const isSelected = plan.code === selectedPlanCode;
              const features =
                plan.featureSummary?.length ? plan.featureSummary : plan.includedFeatures;
              return (
                <button
                  type="button"
                  key={plan.code}
                  className={`efnbmms-plan-card${isSelected ? " selected" : ""}${
                    plan.isPopular ? " popular" : ""
                  }`}
                  onClick={() => setSelectedPlanCode(plan.code)}
                >
                  {plan.isPopular && (
                    <span className="efnbmms-plan-badge">
                      {plan.badgeLabel || "Most popular"}
                    </span>
                  )}
                  <h3>{plan.name}</h3>
                  <p className="efnbmms-plan-desc">{plan.tagline || plan.description}</p>
                  <div className="efnbmms-plan-price">
                    <span className="amount">₹{plan.monthlyPrice}</span>
                    <span className="cycle">/mo</span>
                  </div>
                  <ul>
                    {(features || []).slice(0, 4).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </section>
        )}

        <form className="efnbmms-signup-form" onSubmit={handleContinueToTerms}>
          <h2>Vendor details</h2>
          <div className="efnbmms-form-grid">
            <input
              name="name"
              placeholder="Vendor / business name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="category"
              placeholder="Category (e.g. Vegetables, Dairy) — optional"
              value={form.category}
              onChange={handleChange}
              disabled={submitting}
            />
            <input
              name="panNumber"
              placeholder="PAN number (e.g. ABCDE1234F)"
              value={form.panNumber}
              onChange={handleChange}
              disabled={submitting}
              maxLength={10}
              required
            />
            <input
              name="gstNumber"
              placeholder="GST number (e.g. 22ABCDE1234F1Z5)"
              value={form.gstNumber}
              onChange={handleChange}
              disabled={submitting}
              maxLength={15}
              required
            />
          </div>

          <h2>Business address</h2>
          <div className="efnbmms-form-grid">
            <input
              name="addressLine1"
              placeholder="Address line 1"
              value={form.addressLine1}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="addressLine2"
              placeholder="Address line 2 (optional)"
              value={form.addressLine2}
              onChange={handleChange}
              disabled={submitting}
            />
            <input
              name="landmark"
              placeholder="Landmark (optional)"
              value={form.landmark}
              onChange={handleChange}
              disabled={submitting}
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <input
              name="pincode"
              placeholder="PIN code"
              value={form.pincode}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <h2>Set your login password</h2>
          <div className="efnbmms-form-grid">
            <PasswordField
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <PasswordField
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>
          <p className="efnbmms-hint">
            8+ characters with an uppercase letter, lowercase letter, number, and special
            character.
          </p>

          {selectedPlan && (
            <div className="efnbmms-order-summary">
              <span>Total due today</span>
              <strong>
                {selectedPlan.monthlyPrice > 0 ? `₹${selectedPlan.monthlyPrice}/mo` : "Free"}
              </strong>
            </div>
          )}

          <button
            type="submit"
            className="efnbmms-primary-btn"
            disabled={submitting || !selectedPlan}
          >
            Continue to Terms &amp; Conditions
          </button>
        </form>
      </div>
    </main>
  );
}
