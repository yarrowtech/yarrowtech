import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import API from "../services/api";
import PasswordField from "../components/PasswordField";
import LegalDocumentStep from "../components/LegalDocumentStep";
import Seo from "../components/Seo";
import "./EfnbmmsSignupPage.css";

const PRODUCT_SLUG = "food-and-beverage-management-system";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EMPTY_FORM = {
  businessName: "",
  email: "",
  mobile: "",
  panNumber: "",
  gstNumber: "",
  password: "",
  confirmPassword: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
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

const priceFor = (plan, billingCycle) => {
  if (!plan) return null;
  const offer = billingCycle === "monthly" ? plan.offers?.monthly : plan.offers?.yearly;
  const base = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  if (offer?.enabled && offer.discountedPrice) {
    return { price: offer.discountedPrice, original: base, label: offer.label };
  }
  return { price: base, original: null, label: null };
};

export default function EfnbmmsSignupPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  // "form" -> "terms" -> "privacy" -> (payment kicks off on privacy agree)
  const [flowStep, setFlowStep] = useState("form");
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;

    API.get("/efnbmms/plans")
      .then(({ data }) => {
        if (!active) return;
        const list = data?.plans || [];
        setPlans(list);
        const preferred = list.find((p) => p.isPopular) || list[0];
        if (preferred) setSelectedPlanCode(preferred.code);
      })
      .catch(() => {
        toast.error("Could not load EFNBMMS plans. Please try again later.");
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

  const validate = () => {
    if (!selectedPlan) return "Choose a plan to continue";
    if (!form.businessName.trim()) return "Business name is required";
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim()))
      return "Enter a valid email address";
    if (!form.mobile.trim()) return "Mobile number is required";
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

    const error = validate();
    if (error) return toast.error(error);

    setFlowStep("terms");
  };

  const startSubscription = async () => {
    if (submitting) return;

    const payload = {
      businessName: form.businessName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      address: {
        line1: form.addressLine1.trim(),
        line2: form.addressLine2.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: "India",
      },
      panNumber: form.panNumber.trim().toUpperCase(),
      gstNumber: form.gstNumber.trim().toUpperCase(),
      password: form.password,
      planCode: selectedPlan.code,
      billingCycle,
    };

    try {
      setSubmitting(true);
      setPaymentMessage("Processing your payment…");

      const { data } = await API.post("/efnbmms/signup/order", payload);
      const order = data?.order;
      const keyId = data?.keyId;

      if (!order?.id || !keyId) {
        throw new Error("Could not start payment. Please try again.");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout. Check your connection.");
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "EFNBMMS",
        description: `${selectedPlan.name} — ${billingCycle} subscription`,
        prefill: {
          name: payload.businessName,
          email: payload.email,
          contact: payload.mobile,
        },
        theme: { color: "#16a34a" },
        handler: async (response) => {
          try {
            const verify = await API.post("/efnbmms/signup/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              // Resent so the backend can mirror this signup into
              // Yarrowtech's own Product Users list once payment clears.
              businessName: payload.businessName,
              email: payload.email,
              mobile: payload.mobile,
              address: payload.address,
              password: payload.password,
            });
            setSuccessInfo({
              ...(verify.data?.admin || {}),
              credentialsEmailSent: Boolean(verify.data?.credentialsEmailSent),
              credentialsEmailMessage: verify.data?.credentialsEmailMessage || "",
            });
            toast.success(
              verify.data?.credentialsEmailSent
                ? "Subscription activated! Check your email for login details."
                : "Subscription activated!"
            );
          } catch (verifyError) {
            const message =
              verifyError.response?.data?.message ||
              "Payment received but verification failed. Contact support.";
            toast.error(message);
            setPaymentMessage(message);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setFlowStep("form");
          },
        },
      });

      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setSubmitting(false);
        setFlowStep("form");
      });

      razorpay.open();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Could not start EFNBMMS signup"
      );
      setSubmitting(false);
      setFlowStep("form");
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
            startSubscription();
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
          <p>{paymentMessage || "Processing…"}</p>
          {!submitting && (
            <button
              type="button"
              className="efnbmms-back-link"
              onClick={() => navigate("/products")}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to products
            </button>
          )}
        </div>
      </main>
    );
  }

  if (successInfo) {
    return (
      <main className="efnbmms-signup-page">
        <div className="efnbmms-success-card">
          <CheckCircle2 size={52} className="efnbmms-success-icon" aria-hidden="true" />
          <h1>You're all set, {successInfo.businessName}!</h1>
          <p>
            Your EFNBMMS admin account (<strong>{successInfo.adminId}</strong>) has been
            created and your subscription is active.{" "}
            {successInfo.credentialsEmailSent ? (
              <>
                We've sent your login credentials to <strong>{successInfo.email}</strong>.
              </>
            ) : (
              <>
                We couldn't email your credentials automatically, so use the business email
                and password you just set (<strong>{successInfo.email}</strong>) to log in.
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
      {/* Transactional checkout flow, not a marketing/content page —
          kept out of search results rather than competing for
          "EFNBMMS" queries against the product page itself. */}
      <Seo title="EFNBMMS Admin Signup" path="/efnbmms/signup" noindex />
      <div className="efnbmms-signup-shell">
        <Link
          to="/products/food-and-beverage-management-system"
          className="efnbmms-back-link"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to EFNBMMS overview
        </Link>

        <header className="efnbmms-signup-header">
          <span className="efnbmms-eyebrow">EFNBMMS Subscription — Step 1 of 3</span>
          <h1>Sign up and subscribe to EFNBMMS</h1>
          <p>
            Choose a plan and tell us about your business. You'll review the Terms &amp;
            Conditions and Privacy Policy next, then pay to activate your admin account.
          </p>
        </header>

        <section
          className="efnbmms-billing-toggle"
          role="tablist"
          aria-label="Billing cycle"
        >
          <button
            type="button"
            className={billingCycle === "monthly" ? "active" : ""}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={billingCycle === "yearly" ? "active" : ""}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
          </button>
        </section>

        {plansLoading ? (
          <p className="efnbmms-loading">Loading plans…</p>
        ) : (
          <section className="efnbmms-plan-grid">
            {plans.map((plan) => {
              const pricing = priceFor(plan, billingCycle);
              const isSelected = plan.code === selectedPlanCode;
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
                    <span className="efnbmms-plan-badge">Most popular</span>
                  )}
                  <h3>{plan.name}</h3>
                  <p className="efnbmms-plan-desc">{plan.description}</p>
                  <div className="efnbmms-plan-price">
                    <span className="amount">₹{pricing.price}</span>
                    <span className="cycle">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {pricing.original && pricing.original !== pricing.price && (
                    <span className="efnbmms-plan-original">₹{pricing.original}</span>
                  )}
                  <ul>
                    {(plan.displayFeatures || []).slice(0, 4).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </section>
        )}

        <form className="efnbmms-signup-form" onSubmit={handleContinueToTerms}>
          <h2>Business &amp; contact details</h2>
          <div className="efnbmms-form-grid">
            <input
              name="businessName"
              placeholder="Business name"
              value={form.businessName}
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
              name="mobile"
              placeholder="Mobile number"
              value={form.mobile}
              onChange={handleChange}
              disabled={submitting}
              required
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

          <h2>Set your admin login password</h2>
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
                ₹{priceFor(selectedPlan, billingCycle)?.price} ({billingCycle})
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
