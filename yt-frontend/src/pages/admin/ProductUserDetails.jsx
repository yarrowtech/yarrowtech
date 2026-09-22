import React from "react";
import ProductUserDetails from "../shared/ProductUserDetails";
import { getProductUserDetails } from "../../services/adminService";

export default function AdminProductUserDetails() {
  return (
    <ProductUserDetails
      backPath="/admin/product-users"
      currentRole="admin"
      loadDetails={getProductUserDetails}
      allowChat={false}
    />
  );
}
