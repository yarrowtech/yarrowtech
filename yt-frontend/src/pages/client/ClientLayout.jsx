import React from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "../../components/ClientSidebar";
import ClientNavbar from "../../components/ClientNavbar";
import "../../styles/ClientLayout.css";

export default function ClientLayout() {
  return (
    <div className="client-layout">
      <ClientSidebar />

      <div className="client-content">
        <ClientNavbar />
        <Outlet />
      </div>
    </div>
  );
}
