import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/techSidebar.css";
// import API from "../services/axiosInstance"; // optional

export default function TechSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optional backend logout (NOT required for JWT)
      // await API.post("/erp/auth/logout");
    } catch (err) {
      // Ignore errors
    }

    // ✅ Clear ERP auth data
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_role");
    localStorage.removeItem("erp_name");

    // ✅ Redirect safely
    navigate("/", { replace: true });
  };

  return (
    <aside className="tech-sidebar">
      <h2 className="sidebar-title">Tech Panel</h2>

      <nav className="sidebar-menu">
        <NavLink
          to="/techlead/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/techlead/project-updates"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Project Updates
        </NavLink>

        <NavLink
          to="/techlead/team-overview"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Team Overview
        </NavLink>

        <NavLink
          to="/techlead/profile"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          Profile
        </NavLink>
      </nav>

      {/* 🔴 LOGOUT */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
