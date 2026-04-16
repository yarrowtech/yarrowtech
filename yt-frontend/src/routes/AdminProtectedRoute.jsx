import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("erp_token");
  const role = localStorage.getItem("erp_role");

  if (!token || role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
