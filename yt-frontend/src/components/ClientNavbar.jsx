import { NavLink } from "react-router-dom";
import "../styles/ClientNavbar.css";
import NotificationBell from "./NotificationBell";

export default function ClientNavbar() {
  return (
    <header className="client-navbar">
      <div className="client-nav-left">
        <h2 className="client-brand">Yarrowtech</h2>
      </div>

      <nav className="client-nav-right">
        <NavLink to="/client/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/client/projects" className={({ isActive }) => (isActive ? "active" : "")}>
          Projects
        </NavLink>
        <NavLink to="/client/payments" className={({ isActive }) => (isActive ? "active" : "")}>
          Payments
        </NavLink>
        <NavLink to="/client/history" className={({ isActive }) => (isActive ? "active" : "")}>
          History
        </NavLink>
        <NavLink to="/client/profile" className={({ isActive }) => (isActive ? "profile-btn active" : "profile-btn")}>
          Profile
        </NavLink>
        <NotificationBell viewAllPath="/client/notifications" />
      </nav>
    </header>
  );
}
