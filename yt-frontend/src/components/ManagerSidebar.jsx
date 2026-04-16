import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/ManagerSidebar.css";
import API from "../services/axiosInstance";
import { toast } from "react-hot-toast";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export default function ManagerSidebar() {
  const navigate = useNavigate();

  /* ================= GET MANAGER NAME ================= */
  const erpUser = JSON.parse(localStorage.getItem("erp_user") || "{}");
 const formatName = (name = "") =>
  name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const managerName = formatName(erpUser?.name || "manager");

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await API.post("/erp/auth/logout");
    } catch {
      console.warn("Logout API failed");
    } finally {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_user");

      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="manager-sidebar">
      {/* TOP */}
      <div className="manager-sidebar-top">
        <h2 className="manager-logo">Manager Panel</h2>
        <p className="manager-name"> {managerName}</p>
      </div>

      {/* NAV */}
      <nav className="manager-nav">
        <NavLink to="/manager/dashboard" className="nav-item">
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/manager/projects" className="nav-item">
          <FolderKanban size={18} />
          Manage Projects
        </NavLink>

        <NavLink to="/manager/create-client" className="nav-item">
          <Users size={18} />
          Create Client
        </NavLink>

        <NavLink to="/manager/requests" className="nav-item">
          <Users size={18} />
          CRM Requests
        </NavLink>

        <NavLink to="/manager/notifications" className="nav-item">
          <Bell size={18} />
          Notifications
        </NavLink>

        <NavLink to="/manager/settings" className="nav-item">
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>

      {/* LOGOUT */}
      <div className="manager-sidebar-bottom">
        <button className="manager-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
