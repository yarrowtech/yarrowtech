import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

import "./Header.css";
import logo from "../assets/logo.png";
import CareerForm from "../components/CareerForm";
import ContactPage from "../pages/contact";
import RequestDemoForm from "../components/RequestDemoForm";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE = RAW_API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const IS_GOOGLE_AUTH_ENABLED = Boolean(GOOGLE_CLIENT_ID);

const NAV_LINKS = [
  { label: "Home", hash: "" },
  { label: "Services", hash: "#services" },
  { label: "Products", hash: "#products" },
  { label: "Expertise", hash: "#expertise" },
  { label: "FAQ", hash: "#faq" },
  { label: "About", hash: "#about" },
  { label: "Career", hash: "#career" },
];

export default function Header({ headerClass = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCareer, setShowCareer] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequestDemo, setShowRequestDemo] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  const [resetToken, setResetToken] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("resetToken");

    if (!tokenFromUrl) return;

    setResetToken(tokenFromUrl);
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowResetPasswordModal(true);

    params.delete("resetToken");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  useEffect(() => {
    const sections = ["home", "services", "products", "expertise", "faq", "about"];

    const handleScroll = () => {
      const threshold = 150;
      let nextActiveHash = "";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > threshold) {
          nextActiveHash = `#${id}`;
        }
      });

      setActiveHash(nextActiveHash);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleElevation = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleElevation);
    handleElevation();

    return () => window.removeEventListener("scroll", handleElevation);
  }, []);

  const showToastMessage = (type, message) => {
    if (type === "success") {
      toast.success(message);
      return;
    }

    toast.error(message);
  };

  const closeAuthModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowResetPasswordModal(false);
  };

  const requireLoginFor = (action) => {
    if (user) {
      action();
      return true;
    }

    closeAuthModals();
    setShowLogin(true);
    showToastMessage("error", "Please login first to continue");
    return false;
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.openFreeTrialModal = () => {
      requireLoginFor(() => setShowRequestDemo(true));
    };

    return () => {
      delete window.openFreeTrialModal;
    };
  }, [user]);

  const ERP_DASHBOARD_ROUTES = {
    admin: "/admin/dashboard",
    manager: "/manager/dashboard",
    techlead: "/techlead/dashboard",
    client: "/client/dashboard",
    productuser: "/product-user/dashboard",
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword) {
      showToastMessage("error", "Email and password are required");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        {
          email: loginEmail.trim(),
          password: loginPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { role, token, user: loggedInUser } = res.data;
      const dashboardRoute = ERP_DASHBOARD_ROUTES[role];

      if (dashboardRoute) {
        // ERP staff / client account — hand off to the ERP dashboards
        localStorage.setItem("erp_token", token);
        localStorage.setItem("erp_role", role);
        localStorage.setItem(
          "erp_user",
          JSON.stringify({
            name: loggedInUser.name,
            role,
            email: loggedInUser.email,
          })
        );

        showToastMessage("success", "Login successful!");
        window.location.href = dashboardRoute;
        return;
      }

      // Regular website account
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setLoginEmail("");
      setLoginPassword("");
      closeAuthModals();
      showToastMessage("success", "Login successful!");
    } catch (err) {
      showToastMessage(
        "error",
        err.response?.data?.message || "Login failed"
      );
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !registerConfirmPassword
    ) {
      showToastMessage("error", "All fields are required");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      showToastMessage("error", "Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      closeAuthModals();
      showToastMessage("success", "Account created and logged in!");
    } catch (err) {
      showToastMessage(
        "error",
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    if (!forgotEmail.trim()) {
      showToastMessage("error", "Email is required");
      return;
    }

    try {
      setForgotBusy(true);

      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: forgotEmail.trim(),
      });

      setForgotEmail("");
      setShowForgotPassword(false);
      setShowLogin(true);
      showToastMessage(
        "success",
        res.data?.message || "Password reset link sent"
      );
    } catch (err) {
      showToastMessage(
        "error",
        err.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setForgotBusy(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!resetPasswordValue || !resetConfirmPassword) {
      showToastMessage("error", "Please fill in all password fields");
      return;
    }

    if (resetPasswordValue !== resetConfirmPassword) {
      showToastMessage("error", "Passwords do not match");
      return;
    }

    try {
      setResetBusy(true);

      const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token: resetToken,
        password: resetPasswordValue,
      });

      setResetPasswordValue("");
      setResetConfirmPassword("");
      setResetToken("");
      setShowResetPasswordModal(false);
      setShowLogin(true);
      showToastMessage(
        "success",
        res.data?.message || "Password reset successful"
      );
    } catch (err) {
      showToastMessage(
        "error",
        err.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setResetBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowProfileMenu(false);
    showToastMessage("success", "Logged out successfully");
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    try {
      const credential = googleResponse?.credential;

      if (!credential) {
        showToastMessage("error", "Google login failed");
        return;
      }

      const res = await axios.post(`${API_BASE}/api/auth/google`, {
        credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      closeAuthModals();
      setShowProfileMenu(false);
      showToastMessage("success", "Google login successful!");
    } catch (err) {
      showToastMessage(
        "error",
        err.response?.data?.message || "Google authentication failed"
      );
    }
  };

  const handleGoogleLoginError = () => {
    showToastMessage("error", "Google login was cancelled or failed");
  };

  const handleNav = (event, hash) => {
    event.preventDefault();
    setMenuOpen(false);

    if (hash === "#career") {
      requireLoginFor(() => setShowCareer(true));
      return;
    }

    if (hash === "#contact") {
      requireLoginFor(() => setShowContactModal(true));
      return;
    }

    if (!hash) {
      setActiveHash("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setActiveHash(hash);
    const section = document.getElementById(hash.replace("#", ""));
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const modalAnim = {
    initial: { scale: 0.9, opacity: 0, y: 40 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: 40 },
    transition: { duration: 0.25 },
  };

  const renderAuthActions = () => (
    <>
      <button
        className="btn contact-btn"
        onClick={(event) => handleNav(event, "#contact")}
      >
        Contact Us
      </button>

      {user ? (
        <div className="user-box">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
            className="navbar-user-avatar"
            alt="avatar"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          />

          {showProfileMenu && (
            <div className="profile-dropdown">
              <p className="user-name">{user.name}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="btn login-btn"
          onClick={() => {
            closeAuthModals();
            setShowLogin(true);
          }}
        >
          Login
        </button>
      )}
    </>
  );

  return (
    <>
      <header className={`header${headerClass ? ` ${headerClass}` : ""}${scrolled ? " scrolled" : ""}`}>
        <div className="header-container">
          <motion.a
            href="/"
            className="logo"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="logo-mark">
              <img src={logo} className="logo-img" alt="YarrowTech logo" />
            </span>
            <span className="logo-text">Yarrowtech</span>
          </motion.a>

          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.hash}
                onClick={(event) => handleNav(event, item.hash)}
                className={`nav-link ${activeHash === item.hash ? "active" : ""}`}
              >
                {item.label}
              </a>
            ))}

            <div className="mobile-buttons">
              <button
                className="btn contact-btn"
                onClick={(event) => handleNav(event, "#contact")}
              >
                Contact Us
              </button>

              {user ? (
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <button
                  className="btn login-btn"
                  onClick={() => {
                    closeAuthModals();
                    setShowLogin(true);
                    setMenuOpen(false);
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </nav>

          <div className="header-buttons">{renderAuthActions()}</div>

          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              className="modal login-card header-login-card"
              onClick={(event) => event.stopPropagation()}
              {...modalAnim}
            >
              <button className="modal-close" onClick={() => setShowLogin(false)}>&#x2715;</button>

              <div className="modal-logo-circle">
                <img src={logo} alt="YarrowTech logo" />
              </div>

              <h2 className="modal-title">Log in</h2>
              <p className="modal-subtitle">
                Don&apos;t have an account?&nbsp;
                <span className="modal-subtitle-link" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                  Create Account
                </span>
              </p>

              <form className="modal-form" onSubmit={handleLogin}>
                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-group">
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className="input-group">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowLoginPassword((prev) => !prev)}>
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="auth-meta-row">
                    <button type="button" className="forgot-link" onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <button className="submit-btn" type="submit">Log in</button>
              </form>

              <div className="divider"><span>or</span></div>

              <div className="google-auth-box">
                {IS_GOOGLE_AUTH_ENABLED ? (
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                  />
                ) : (
                  <p className="google-auth-disabled">
                    Google login is not configured
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              className="modal login-card header-login-card"
              onClick={(event) => event.stopPropagation()}
              {...modalAnim}
            >
              <button className="modal-close" onClick={() => setShowRegister(false)}>&#x2715;</button>

              <div className="modal-logo-circle">
                <img src={logo} alt="YarrowTech logo" />
              </div>

              <h2 className="modal-title">Create Account</h2>
              <p className="modal-subtitle">Join YarrowTech today</p>

              <form className="modal-form" onSubmit={handleRegister}>
                <div className="form-field">
                  <label>Full Name</label>
                  <div className="input-group">
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={registerName}
                      onChange={(event) => setRegisterName(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <div className="input-group">
                    <Mail size={16} />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className="input-group">
                    <Lock size={16} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowRegisterPassword((prev) => !prev)}>
                      {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Confirm Password</label>
                  <div className="input-group">
                    <Lock size={16} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerConfirmPassword}
                      onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <button className="submit-btn" type="submit">Create Account</button>
              </form>

              <p className="login-footer">
                Already have an account?
                <span
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                >
                  Login
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              className="modal login-card header-login-card"
              onClick={(event) => event.stopPropagation()}
              {...modalAnim}
            >
              <button className="modal-close" onClick={() => setShowForgotPassword(false)}>&#x2715;</button>

              <div className="modal-logo-circle">
                <img src={logo} alt="YarrowTech logo" />
              </div>

              <h2 className="modal-title">Forgot Password</h2>
              <p className="modal-subtitle">
                Enter your email and we&apos;ll send a reset link.
              </p>

              <form className="modal-form" onSubmit={handleForgotPassword}>
                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-group">
                    <Mail size={16} />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(event) => setForgotEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <button className="submit-btn" type="submit" disabled={forgotBusy}>
                  {forgotBusy ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="login-footer">
                Remembered your password?
                <span
                  onClick={() => {
                    setShowForgotPassword(false);
                    setShowLogin(true);
                  }}
                >
                  Back to login
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetPasswordModal && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowResetPasswordModal(false)}
          >
            <motion.div
              className="modal login-card header-login-card"
              onClick={(event) => event.stopPropagation()}
              {...modalAnim}
            >
              <button
                className="modal-close"
                onClick={() => setShowResetPasswordModal(false)}
              >
                &#x2715;
              </button>


              <div className="modal-logo-circle">
                <img src={logo} alt="YarrowTech logo" />
              </div>
              <h2 className="modal-title">Set New Password</h2>
              <p className="modal-subtitle">
                Enter your new password below to finish resetting your account.
              </p>

              <form className="modal-form" onSubmit={handleResetPassword}>
                <label>New Password</label>
                <div className="password-field">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a new password"
                    value={resetPasswordValue}
                    onChange={(event) =>
                      setResetPasswordValue(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                  >
                    {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <label>Confirm New Password</label>
                <input
                  type={showResetPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={resetConfirmPassword}
                  onChange={(event) =>
                    setResetConfirmPassword(event.target.value)
                  }
                  required
                />

                <button className="submit-btn" type="submit" disabled={resetBusy}>
                  {resetBusy ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CareerForm
        open={showCareer}
        onClose={() => setShowCareer(false)}
        showToast={showToastMessage}
        currentUser={user}
      />

      <ContactPage
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        isModal
        currentUser={user}
      />

      {showRequestDemo && (
        <RequestDemoForm
          onClose={() => setShowRequestDemo(false)}
          showToast={showToastMessage}
          currentUser={user}
        />
      )}
    </>
  );
}




