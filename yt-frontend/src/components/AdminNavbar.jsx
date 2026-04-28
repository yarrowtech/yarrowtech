import "../styles/AdminNavbar.css";
import NotificationBell from "./NotificationBell";

export default function AdminNavbar() {
  return (
    <div className="admin-navbar">
      <h3>Admin Dashboard</h3>
      <div className="admin-actions">
        <NotificationBell viewAllPath="/admin/notifications" />
      </div>
    </div>
  );
}
