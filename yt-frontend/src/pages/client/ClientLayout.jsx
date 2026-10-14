import React from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "../../components/ClientSidebar";
import MobileTopBar from "../../components/MobileTopBar";
import useMobileShell from "../../hooks/useMobileShell";
import "../../styles/ClientLayout.css";
import "../../styles/ClientMobile.css";

export default function ClientLayout() {
  const { navOpen, openNav, closeNav } = useMobileShell(".client-content");

  return (
    <div className="client-layout client-shell">
      <MobileTopBar title="Client Panel" open={navOpen} onOpen={openNav} />
      <ClientSidebar open={navOpen} onClose={closeNav} />
      {navOpen && <div className="app-backdrop" onClick={closeNav} />}

      <div className="client-content">
        <Outlet />
      </div>
    </div>
  );
}
