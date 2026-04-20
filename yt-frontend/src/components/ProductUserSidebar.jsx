import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Box, CreditCard, MessageSquare, LogOut, Menu } from "lucide-react";
import { toast } from "react-hot-toast";

import API from "../services/axiosInstance";
import "../styles/ClientSidebar.css";

export default function ProductUserSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", icon: <Home size={20} />, to: "/product-user/dashboard" },
    { label: "Project", icon: <Box size={20} />, to: "/product-user/projects" },
    { label: "Payments", icon: <CreditCard size={20} />, to: "/product-user/payments" },
    { label: "Chat", icon: <MessageSquare size={20} />, to: "/product-user/chat" },
  ];

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
    <>
      <div
        className={`client-sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <button className="client-sidebar-toggle" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      <aside className={`client-sidebar ${open ? "open" : ""}`}>
        <div className="client-sidebar-top">
          <h2 className="client-sidebar-logo">Product User</h2>
        </div>

        <nav className="client-sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `client-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="client-sidebar-bottom">
          <button className="client-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
