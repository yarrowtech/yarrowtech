import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import MobileTopBar from "../../components/MobileTopBar";
import useMobileShell from "../../hooks/useMobileShell";
import "../../styles/Admin.css";
import "../../styles/ResponsiveShell.css";

export default function AdminLayout() {
  const { navOpen, openNav, closeNav } = useMobileShell(".admin-content");

  return (
    <div className="admin-layout app-shell">
      <MobileTopBar title="Admin Panel" open={navOpen} onOpen={openNav} />
      <Sidebar open={navOpen} onClose={closeNav} />
      {navOpen && <div className="app-backdrop" onClick={closeNav} />}

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
