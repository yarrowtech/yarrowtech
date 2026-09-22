import React from "react";
import ProductUserDetails from "../shared/ProductUserDetails";
import { getManagerProductUserDetails } from "../../services/managerService";

export default function ManagerProductUserDetails() {
  return (
    <ProductUserDetails
      backPath="/manager/product-users"
      currentRole="manager"
      loadDetails={getManagerProductUserDetails}
    />
  );
}
