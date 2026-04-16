import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ERPProtectedRoute({ role, children }) {
  const token = localStorage.getItem("erp_token");

  // 🔐 ONLY authentication check
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Role check (SAFE + NORMALIZED)
  if (role) {
    const savedRole = (localStorage.getItem("erp_role") || "")
      .trim()
      .toLowerCase();

    const requiredRole = role.trim().toLowerCase();

    // ❗ Only block when role DEFINITELY mismatches
    if (savedRole && savedRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // ✅ NEVER block on API errors or re-renders
  return children ? children : <Outlet />;
}
