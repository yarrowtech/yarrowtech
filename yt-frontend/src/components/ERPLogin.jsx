import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import "../styles/ERPLogin.css";

export default function ERPLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/erp/auth/login",
        { email, password }
      );

      localStorage.setItem("erp_token", res.data.token);
      localStorage.setItem("erp_role", res.data.role);
      localStorage.setItem(
        "erp_user",
        JSON.stringify({
          name: res.data.name,
          role: res.data.role,
          email,
        })
      );

      toast.success("Login successful");

      if (res.data.role === "admin") window.location.href = "/admin/dashboard";
      else if (res.data.role === "manager") window.location.href = "/manager/dashboard";
      else if (res.data.role === "techlead") window.location.href = "/techlead/dashboard";
      else if (res.data.role === "client") window.location.href = "/client/dashboard";
      else if (res.data.role === "productuser") window.location.href = "/product-user/dashboard";

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-login-page">
      <div className="erp-login-card">
        <h2 className="erp-title">ERP Login</h2>
        <p className="erp-subtitle">
          Sign in to access your dashboard
        </p>

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className="erp-input-group">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* PASSWORD */}
          <div className="erp-input-group">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="erp-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* FORGOT PASSWORD */}
          <div className="erp-forgot">
            <a href="/erp/forgot-password">Forgot password?</a>
          </div>

          {/* SUBMIT */}
          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="erp-footer">
          © {new Date().getFullYear()} YarrowTech ERP
        </div>
      </div>
    </div>
  );
}
