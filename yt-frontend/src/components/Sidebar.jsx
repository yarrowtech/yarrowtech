
// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import API from "../services/axiosInstance";
// import "../styles/Sidebar.css";

// export default function Sidebar() {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       // 🔹 Call backend logout (optional but you requested it)
//       await API.post("/erp/auth/logout");
//     } catch (err) {
//       console.warn("Backend logout failed (safe to ignore)");
//     } finally {
//       // 🔹 Clear frontend auth
//       localStorage.removeItem("erp_token");
//       localStorage.removeItem("erp_role");
//       localStorage.removeItem("erp_user");

//       // 🔹 Redirect to HOME (✅ exists)
//       navigate("/", { replace: true });
//     }
//   };

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-title">Admin Panel</h2>

//       <ul className="sidebar-menu">
//         <li>
//           <NavLink to="/admin/dashboard" className="sidebar-link">
//             Dashboard
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/admin/projects" className="sidebar-link">
//             Projects
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/admin/requests" className="sidebar-link">
//             Demo Requests
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/admin/users" className="sidebar-link">
//             Users
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/admin/settings" className="sidebar-link">
//             Settings
//           </NavLink>
//         </li>
//       </ul>

//       {/* 🔴 LOGOUT BUTTON */}
//       <button className="logout-btn" onClick={handleLogout}>
//         Logout
//       </button>
//     </div>
//   );
// }





// 28.3 better ui 


import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  FileText,
  Users,
  Mail,
  Briefcase,
  Settings,
  Layers3,
  LogOut,
} from "lucide-react";

import API from "../services/axiosInstance";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/erp/auth/logout");
    } catch (err) {
      console.warn("Backend logout failed");
    } finally {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_user");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      {/* 🔷 Logo */}
      <h2 className="sidebar-title">Admin Panel</h2>

      {/* 🔷 MAIN NAV */}
      <div className="sidebar-section">
        <p className="section-title">MAIN</p>

        <NavItem
          to="/admin/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />

        <NavItem
          to="/admin/projects"
          icon={<Folder size={18} />}
          label="Projects"
        />

        <NavItem
          to="/admin/requests"
          icon={<FileText size={18} />}
          label="Demo Requests"
        />

        <NavItem
          to="/admin/users"
          icon={<Users size={18} />}
          label="Users"
        />

        <NavItem
          to="/admin/product-users"
          icon={<Layers3 size={18} />}
          label="Product Users"
        />

        <NavItem
          to="/admin/contacts"
          icon={<Mail size={18} />}
          label="Contact Forms"
        />

        <NavItem
          to="/admin/careers"
          icon={<Briefcase size={18} />}
          label="Career Forms"
        />
      </div>

      {/* 🔷 SYSTEM */}
      <div className="sidebar-section">
        <p className="section-title">SYSTEM</p>

        <NavItem
          to="/admin/settings"
          icon={<Settings size={18} />}
          label="Settings"
        />
      </div>

      {/* 🔴 LOGOUT */}
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* 🔹 Reusable Nav Item */
const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink to={to} className="sidebar-link">
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
