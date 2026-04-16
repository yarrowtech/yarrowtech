import React from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../../components/ManagerSidebar";
import ManagerNavbar from "../../components/ManagerNavbar";
import "../../styles/ManagerLayout.css";

export default function ManagerLayout() {
  return (
    <div className="manager-layout">
      {/* ✅ ALWAYS SHOW SIDEBAR */}
      <ManagerSidebar />

      <div className="manager-content">
        <ManagerNavbar />

        <div className="manager-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
