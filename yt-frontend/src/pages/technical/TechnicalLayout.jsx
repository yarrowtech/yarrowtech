import React from "react";
import { Outlet } from "react-router-dom";
import TechSidebar from "../../components/TechSidebar";
import TechNavbar from "../../components/TechNavbar";
import "../../styles/technicalLayout.css";

export default function TechnicalLayout() {
  return (
    <div className="technical-layout">

      {/* Left Sidebar */}
      <TechSidebar />

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
