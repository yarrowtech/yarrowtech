import React from "react";
import { NavLink } from "react-router-dom";

import "../styles/ClientNavbar.css";

export default function ProductUserNavbar() {
  return (
    <header className="client-navbar">
      <div className="client-nav-left">
        <h2 className="client-brand">Yarrowtech</h2>
      </div>

      <nav className="client-nav-right">
        <NavLink
          to="/product-user/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/product-user/projects"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Project
        </NavLink>
        <NavLink
          to="/product-user/payments"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Payments
        </NavLink>
        <NavLink
          to="/product-user/chat"
          className={({ isActive }) =>
            isActive ? "profile-btn active" : "profile-btn"
          }
        >
          Chat
        </NavLink>
      </nav>
    </header>
  );
}
