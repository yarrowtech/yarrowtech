import React from "react";
import ProductUserManagement from "../shared/ProductUserManagement";
import { getManagerProductUsers } from "../../services/managerService";

export default function ManagerProductUsers() {
  return (
    <ProductUserManagement
      title="Product User Management"
      subtitle="See the product users assigned to you and manage communication."
      loadItems={getManagerProductUsers}
      basePath="/manager/product-users"
      currentRole="manager"
    />
  );
}
