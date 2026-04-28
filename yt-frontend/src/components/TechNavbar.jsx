import "../styles/techNavbar.css";
import NotificationBell from "./NotificationBell";

export default function TechNavbar() {
  return (
    <header className="tech-navbar">
      <h2 className="tech-brand">Yarrowtech - Technical Head</h2>
      <div className="tech-nav-right">
        <span className="tech-user">Welcome, Technical Head</span>
        <NotificationBell viewAllPath="/techlead/notifications" />
      </div>
    </header>
  );
}
