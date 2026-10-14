import React from "react";
import ProductUserManagement from "../shared/ProductUserManagement";
import { getManagerProductSubscriptions } from "../../services/managerService";

export default function ManagerProductUsers({ embedded = false }) {
  return (
    <ProductUserManagement
      title="Product Subscriptions"
      subtitle="Select a product to see everyone who subscribed to it."
      loadSubscriptions={getManagerProductSubscriptions}
      basePath="/manager/product-users"
      currentRole="manager"
      allowChat={false}
      embedded={embedded}
    />
  );
}
