import "../styles/ManagerNavbar.css";
import NotificationBell from "./NotificationBell";

export default function ManagerNavbar() {
  return (
    <header className="manager-navbar">
      <h3 className="nav-title">Welcome, Manager</h3>
      <div className="nav-actions">
        <NotificationBell viewAllPath="/manager/notifications" />
      </div>
    </header>
  );
}
