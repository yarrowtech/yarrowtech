import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Check, CheckCircle2, Lock } from "lucide-react";
import API from "../services/api";
import { trackProjectEvent } from "../services/projectTracking";
import PasswordField from "../components/PasswordField";
import LegalDocumentStep from "../components/LegalDocumentStep";
import Seo from "../components/Seo";
import CaptchaField, { useCaptchaConfig } from "../components/CaptchaField";
import "./EfnbmmsSignupPage.css";
import "./EfnbmmsCheckout.css";

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
  const captcha = useCaptchaConfig();
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaPass, setCaptchaPass] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
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

  const handleContinueToTerms = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const error = validate();
    if (error) return toast.error(error);

    if (captcha.enabled && !captchaPass) {
      if (!captchaToken) return toast.error("Please complete the security check.");
      try {
        const { data } = await API.post("/efnbmms/captcha/verify", { token: captchaToken });
        setCaptchaPass(data.pass || "");
      } catch (err) {
        setCaptchaToken("");
        setCaptchaReset((n) => n + 1);
        return toast.error(err?.response?.data?.message || "Security check failed. Please try again.");
      }
    }

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
      ...(captchaPass ? { captchaPass } : {}),
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
            trackProjectEvent('signup');
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

  const selectedPricing = selectedPlan ? priceFor(selectedPlan, billingCycle) : null;
  const cycleLabel = billingCycle === "monthly" ? "month" : "year";

  return (
    <main className="efnbmms-signup-page ck-page">
      {/* Transactional checkout flow, not a marketing/content page —
          kept out of search results rather than competing for
          "EFNBMMS" queries against the product page itself. */}
      <Seo title="EFNBMMS Admin Signup" path="/efnbmms/signup" noindex />
      <div className="ck-shell">
        <Link to="/products/food-and-beverage-management-system" className="ck-back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to EFNBMMS overview
        </Link>

        <header className="ck-header">
          <div>
            <h1>Create your EFNBMMS account</h1>
            <p>Pick a plan, add your business details, then review the terms and pay securely.</p>
          </div>
          <ol className="ck-steps" aria-label="Signup steps">
            <li className="active"><span>1</span> Details</li>
            <li><span>2</span> Terms</li>
            <li><span>3</span> Payment</li>
          </ol>
        </header>

        <form className="ck-layout" onSubmit={handleContinueToTerms} noValidate={false}>
          {/* ───────── LEFT: plan + details ───────── */}
          <div className="ck-main">
            <section className="ck-card">
              <div className="ck-card-head">
                <h2><span className="ck-num">1</span> Choose your plan</h2>
                <div className="ck-toggle" role="tablist" aria-label="Billing cycle">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={billingCycle === "monthly"}
                    className={billingCycle === "monthly" ? "active" : ""}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={billingCycle === "yearly"}
                    className={billingCycle === "yearly" ? "active" : ""}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {plansLoading ? (
                <p className="ck-muted">Loading plans…</p>
              ) : (
                <div className="ck-plans" role="radiogroup" aria-label="Plan">
                  {plans.map((plan) => {
                    const pricing = priceFor(plan, billingCycle);
                    const isSelected = plan.code === selectedPlanCode;
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        key={plan.code}
                        className={`ck-plan${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedPlanCode(plan.code)}
                      >
                        {plan.isPopular && <span className="ck-badge">Most popular</span>}
                        <span className="ck-plan-check" aria-hidden="true">
                          {isSelected && <Check size={14} />}
                        </span>
                        <strong className="ck-plan-name">{plan.name}</strong>
                        <span className="ck-plan-desc">{plan.description}</span>
                        <span className="ck-plan-price">
                          <b>₹{pricing.price}</b>
                          <i>/{billingCycle === "monthly" ? "mo" : "yr"}</i>
                          {pricing.original && pricing.original !== pricing.price && (
                            <s>₹{pricing.original}</s>
                          )}
                        </span>
                        <ul>
                          {(plan.displayFeatures || []).slice(0, 4).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="ck-card">
              <h2><span className="ck-num">2</span> Business details</h2>
              <div className="ck-grid">
                <label className="ck-field">
                  <span>Business name</span>
                  <input name="businessName" placeholder="e.g. Sunrise Restaurant" value={form.businessName} onChange={handleChange} disabled={submitting} required autoComplete="organization" />
                </label>
                <label className="ck-field">
                  <span>Email address</span>
                  <input name="email" type="email" placeholder="you@business.com" value={form.email} onChange={handleChange} disabled={submitting} required autoComplete="email" />
                </label>
                <label className="ck-field">
                  <span>Mobile number</span>
                  <input name="mobile" placeholder="10-digit mobile" value={form.mobile} onChange={handleChange} disabled={submitting} required inputMode="tel" autoComplete="tel" />
                </label>
                <label className="ck-field">
                  <span>PAN number</span>
                  <input name="panNumber" placeholder="ABCDE1234F" value={form.panNumber} onChange={handleChange} disabled={submitting} maxLength={10} required />
                </label>
                <label className="ck-field ck-span">
                  <span>GST number</span>
                  <input name="gstNumber" placeholder="22ABCDE1234F1Z5" value={form.gstNumber} onChange={handleChange} disabled={submitting} maxLength={15} required />
                </label>
              </div>
            </section>

            <section className="ck-card">
              <h2><span className="ck-num">3</span> Business address</h2>
              <div className="ck-grid">
                <label className="ck-field ck-span">
                  <span>Address line 1</span>
                  <input name="addressLine1" placeholder="Building, street" value={form.addressLine1} onChange={handleChange} disabled={submitting} required autoComplete="address-line1" />
                </label>
                <label className="ck-field">
                  <span>Address line 2 <em>(optional)</em></span>
                  <input name="addressLine2" placeholder="Area, locality" value={form.addressLine2} onChange={handleChange} disabled={submitting} autoComplete="address-line2" />
                </label>
                <label className="ck-field">
                  <span>Landmark <em>(optional)</em></span>
                  <input name="landmark" placeholder="Near…" value={form.landmark} onChange={handleChange} disabled={submitting} />
                </label>
                <label className="ck-field">
                  <span>City</span>
                  <input name="city" placeholder="City" value={form.city} onChange={handleChange} disabled={submitting} required autoComplete="address-level2" />
                </label>
                <label className="ck-field">
                  <span>State</span>
                  <input name="state" placeholder="State" value={form.state} onChange={handleChange} disabled={submitting} required autoComplete="address-level1" />
                </label>
                <label className="ck-field">
                  <span>PIN code</span>
                  <input name="pincode" placeholder="6-digit PIN" value={form.pincode} onChange={handleChange} disabled={submitting} required inputMode="numeric" autoComplete="postal-code" />
                </label>
              </div>
            </section>

            <section className="ck-card">
              <h2><span className="ck-num">4</span> Admin login password</h2>
              <div className="ck-grid">
                <div className="ck-field">
                  <span>Password</span>
                  <PasswordField name="password" placeholder="Create a password" value={form.password} onChange={handleChange} disabled={submitting} required />
                </div>
                <div className="ck-field">
                  <span>Confirm password</span>
                  <PasswordField name="confirmPassword" placeholder="Repeat the password" value={form.confirmPassword} onChange={handleChange} disabled={submitting} required />
                </div>
              </div>
              <ul className="ck-rules" aria-label="Password rules">
                <li className={form.password.length >= 8 ? "ok" : ""}>8+ characters</li>
                <li className={/[A-Z]/.test(form.password) ? "ok" : ""}>Uppercase letter</li>
                <li className={/[a-z]/.test(form.password) ? "ok" : ""}>Lowercase letter</li>
                <li className={/\d/.test(form.password) ? "ok" : ""}>Number</li>
                <li className={/[^A-Za-z\d]/.test(form.password) ? "ok" : ""}>Special character</li>
                <li className={form.confirmPassword && form.password === form.confirmPassword ? "ok" : ""}>Passwords match</li>
              </ul>
            </section>
          </div>

          {/* ───────── RIGHT: summary + security + continue ───────── */}
          <aside className="ck-summary">
            <h2>Order summary</h2>

            {selectedPlan ? (
              <>
                <div className="ck-sum-plan">
                  <div>
                    <strong>{selectedPlan.name}</strong>
                    <span>Billed {billingCycle}</span>
                  </div>
                  <button type="button" className="ck-link" onClick={() => document.querySelector(".ck-plans")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                    Change
                  </button>
                </div>
                <ul className="ck-sum-features">
                  {(selectedPlan.displayFeatures || []).slice(0, 4).map((feature) => (
                    <li key={feature}><Check size={14} aria-hidden="true" /> {feature}</li>
                  ))}
                </ul>
                <div className="ck-total">
                  <span>Total due today</span>
                  <strong>
                    ₹{selectedPricing?.price}
                    <small> / {cycleLabel}</small>
                  </strong>
                </div>
              </>
            ) : (
              <p className="ck-muted">Select a plan to see your total.</p>
            )}

            {!captchaPass && (
              <CaptchaField key={captchaReset} resetKey={captchaReset} onToken={setCaptchaToken} />
            )}

            <button type="submit" className="ck-submit" disabled={submitting || !selectedPlan}>
              Continue to Terms &amp; Conditions
            </button>

            <p className="ck-secure">
              <Lock size={14} aria-hidden="true" /> You will review the terms, then pay securely with
              Razorpay. Nothing is charged on this step.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
