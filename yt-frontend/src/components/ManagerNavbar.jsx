import React from "react";
import "../styles/ManagerNavbar.css";
import { Bell } from "lucide-react";

export default function ManagerNavbar() {
  return (
    <header className="manager-navbar">
      {/* TITLE */}
      <h3 className="nav-title">Welcome, Manager</h3>

      {/* RIGHT ACTIONS */}
      <div className="nav-actions">
        <div className="icon-box">
          <Bell className="nav-icon" />
        </div>
      </div>
    </header>
  );
}
