import React from "react";
import { Outlet } from "react-router-dom";

import ProductUserSidebar from "../../components/ProductUserSidebar";
import "../../styles/ClientLayout.css";

export default function ProductUserLayout() {
  return (
    <div className="client-layout">
      <ProductUserSidebar />
      <div className="client-content">
        <Outlet />
      </div>
    </div>
  );
}
