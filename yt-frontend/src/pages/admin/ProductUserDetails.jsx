import React from "react";
import ProductUserDetails from "../shared/ProductUserDetails";
import {
  addProductUserPayment,
  getProductUserDetails,
  updateProductUserPaymentSummary,
} from "../../services/adminService";

export default function AdminProductUserDetails() {
  return (
    <ProductUserDetails
      backPath="/admin/product-users"
      currentRole="admin"
      loadDetails={getProductUserDetails}
      updatePaymentSummary={updateProductUserPaymentSummary}
      addPayment={addProductUserPayment}
      allowChat={false}
    />
  );
}
