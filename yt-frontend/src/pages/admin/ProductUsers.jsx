import React from "react";
import ProductUserManagement from "../shared/ProductUserManagement";
import { getProductUsers } from "../../services/adminService";

export default function AdminProductUsers() {
  return (
    <ProductUserManagement
      title="Product User Management"
      subtitle="View all product users and open their profile."
      loadItems={getProductUsers}
      basePath="/admin/product-users"
      currentRole="admin"
      allowChat={false}
    />
  );
}
