import React from "react";
import { Outlet } from "react-router-dom";
import TechSidebar from "../../components/TechSidebar";
import TechNavbar from "../../components/TechNavbar";
import MobileTopBar from "../../components/MobileTopBar";
import useMobileShell from "../../hooks/useMobileShell";
import "../../styles/technicalLayout.css";
import "../../styles/ResponsiveShell.css";

export default function TechnicalLayout() {
  const { navOpen, openNav, closeNav } = useMobileShell(".technical-content");

  return (
    <div className="technical-layout app-shell">
      <MobileTopBar title="Tech Panel" open={navOpen} onOpen={openNav} />

      {/* Left Sidebar (drawer on phones) */}
      <TechSidebar open={navOpen} onClose={closeNav} />
      {navOpen && <div className="app-backdrop" onClick={closeNav} />}

      {/* Main Content Area */}
      <div className="technical-main">
        <TechNavbar />

        <div className="technical-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
