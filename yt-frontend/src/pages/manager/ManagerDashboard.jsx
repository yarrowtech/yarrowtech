import React, { useEffect, useState } from "react";
import "../../styles/ManagerDashboard.css";
import {
  Users,
  FolderKanban,
  Bell,
  CheckCircle,
} from "lucide-react";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    notifications: 0,
  });

  const [recent, setRecent] = useState([]);

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      // ✅ FIXED ROUTE (NO /api HERE)
      const res = await API.get("/erp/manager/projects");

      const projects = Array.isArray(res.data?.projects)
        ? res.data.projects
        : [];

      /* ================= STATS ================= */
      const uniqueClients = new Set(
        projects.map((p) => p.clientEmail).filter(Boolean)
      );

      const activeProjects = projects.filter(
        (p) => p.status !== "completed"
      );

      const completedProjects = projects.filter(
        (p) => p.status === "completed"
      );

      setStats({
        totalClients: uniqueClients.size,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        notifications: 0, // hook real API later
      });

      /* ================= RECENT ACTIVITY ================= */
      const recentItems = projects
        .slice(0, 5)
        .map((p) => ({
          id: p._id,
          message: `📁 Project "${p.name}" for ${p.clientName || "Client"}`,
          time: new Date(p.createdAt).toLocaleString(),
        }));

      setRecent(recentItems);
    } catch (err) {
      console.error("❌ Manager dashboard error:", err);
      toast.error("Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= UI ================= */
  if (loading) {
    return <p className="muted">Loading dashboard...</p>;
  }

  return (
    <div className="manager-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Quick insights into your clients, projects, and activities.</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <h3>{stats.totalClients}</h3>
          <p>Total Clients</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FolderKanban size={28} />
          </div>
          <h3>{stats.activeProjects}</h3>
          <p>Active Projects</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <h3>{stats.completedProjects}</h3>
          <p>Completed</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Bell size={28} />
          </div>
          <h3>{stats.notifications}</h3>
          <p>Notifications</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="recent-section">
        <h3>Recent Activity</h3>

        {recent.length === 0 && (
          <p className="muted">No recent activity</p>
        )}

        {recent.map((item) => (
          <div key={item.id} className="recent-card">
            <p>{item.message}</p>
            <span>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
