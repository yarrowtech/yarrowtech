import React from "react";
import ProductUserManagement from "../shared/ProductUserManagement";
import { getProductSubscriptions } from "../../services/adminService";

export default function AdminProductUsers() {
  return (
    <ProductUserManagement
      title="Product Subscriptions"
      subtitle="Select a product to see all of its subscription details."
      loadSubscriptions={getProductSubscriptions}
      basePath="/admin/product-users"
      currentRole="admin"
      allowChat={false}
    />
  );
}
