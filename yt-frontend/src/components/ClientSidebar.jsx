// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   Home,
//   Box,
//   CreditCard,
//   Clock3,
//   User,
// } from "lucide-react";
// import "../styles/ClientSidebar.css";

// export default function ClientSidebar() {
//   const [collapsed, setCollapsed] = useState(false);

//   const menu = [
//     { label: "Dashboard", icon: <Home size={20} />, to: "/client/dashboard" },
//     { label: "My Projects", icon: <Box size={20} />, to: "/client/projects" },
//     { label: "Payments", icon: <CreditCard size={20} />, to: "/client/payments" },
//     { label: "History", icon: <Clock3 size={20} />, to: "/client/history" },
//     { label: "Profile", icon: <User size={20} />, to: "/client/profile" },
//   ];

//   return (
//     <aside className={`client-sidebar ${collapsed ? "collapsed" : ""}`}>
//       {/* Header */}
//       <div className="client-sidebar-top">
//         <h2 className="client-sidebar-logo">
//           {!collapsed && "Client Panel"}
//         </h2>
//       </div>

//       {/* Menu */}
//       <nav className="client-sidebar-nav">
//         {menu.map((item) => (
//           <NavLink
//             key={item.label}
//             to={item.to}
//             className={({ isActive }) =>
//               `client-sidebar-link ${isActive ? "active" : ""}`
//             }
//           >
//             {item.icon}
//             {!collapsed && <span>{item.label}</span>}
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// }






import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Box,
  CreditCard,
  User,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../services/axiosInstance";
import ThemeToggle from "./ThemeToggle";
import "../styles/ClientSidebar.css";

export default function ClientSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard",     icon: <Home size={20} />,     to: "/client/dashboard" },
    { label: "My Projects",   icon: <Box size={20} />,      to: "/client/projects" },
    { label: "Payments",      icon: <CreditCard size={20} />, to: "/client/payments" },
    { label: "Notifications", icon: <Bell size={20} />,     to: "/client/notifications" },
    { label: "Profile",       icon: <User size={20} />,     to: "/client/profile" },
  ];

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await API.post("/erp/auth/logout");
    } catch {
      console.warn("Logout API failed");
    } finally {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_user");

      toast.success("Logged out successfully");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    }
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        className={`client-sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* HAMBURGER (MOBILE) */}
      <button className="client-sidebar-toggle" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      {/* SIDEBAR */}
      <aside className={`client-sidebar ${open ? "open" : ""}`}>
        {/* TOP */}
        <div className="client-sidebar-top">
          <h2 className="client-sidebar-logo">Client Panel</h2>
        </div>

        {/* MENU */}
        <nav className="client-sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `client-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="client-sidebar-bottom">
          <div style={{ marginBottom: 10 }}>
            <ThemeToggle />
          </div>
          <button className="client-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
