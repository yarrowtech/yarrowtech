// import React, { useState, useEffect, useRef } from "react";
// import { User, LogOut, Bell } from "lucide-react";
// import "../styles/AdminNavbar.css";

// export default function AdminNavbar() {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleProfile = () => {
//     alert("Profile clicked!");
//   };

//   const handleLogout = () => {
//     // REMOVE TOKEN
//     localStorage.removeItem("adminToken");

//     // REDIRECT to login page
//     window.location.href = "/admin/login";
//   };

//   return (
//     <div className="admin-navbar">
//       <h3 className="navbar-title">Admin Dashboard</h3>

//       <div className="navbar-right">
//         {/* Notification Icon */}
//         <div className="icon-container">
//           <Bell className="nav-icon" />
//         </div>

//         {/* Profile Section */}
//         <div
//           className="profile-wrapper"
//           onClick={() => setOpen(!open)}
//           ref={menuRef}
//         >
//           <img
//             src="https://avatar.iran.liara.run/public"
//             alt="admin"
//             className="profile-img"
//           />
//           <span className="profile-name">Admin User</span>

//           {/* Dropdown */}
//           {open && (
//             <div className="dropdown-menu">
//               <div className="dropdown-item" onClick={handleProfile}>
//                 <User className="dropdown-icon" />
//                 <span>Profile</span>
//               </div>

//               <div className="dropdown-separator"></div>

//               <div className="dropdown-item logout" onClick={handleLogout}>
//                 <LogOut className="dropdown-icon" />
//                 <span>Logout</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import React from "react";
import "../styles/AdminNavbar.css";

export default function AdminNavbar() {
  return (
    <div className="admin-navbar">
      <h3>Admin Dashboard</h3>

      {/* 
        Logout button intentionally removed.
        Logout is handled from Sidebar only.
      */}
      <div className="admin-actions"></div>
    </div>
  );
}
