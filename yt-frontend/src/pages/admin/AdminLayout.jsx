import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <AdminNavbar />
        <Outlet />
      </div>
    </div>
  );
}
