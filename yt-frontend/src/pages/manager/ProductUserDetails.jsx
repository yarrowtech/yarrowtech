import React from "react";
import ProductUserDetails from "../shared/ProductUserDetails";
import {
  addManagerProductUserPayment,
  getManagerProductUserDetails,
  updateManagerProductUserPaymentSummary,
} from "../../services/managerService";

export default function ManagerProductUserDetails() {
  return (
    <ProductUserDetails
      backPath="/manager/product-users"
      currentRole="manager"
      loadDetails={getManagerProductUserDetails}
      updatePaymentSummary={updateManagerProductUserPaymentSummary}
      addPayment={addManagerProductUserPayment}
    />
  );
}
