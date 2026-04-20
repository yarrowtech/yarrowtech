import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ManagerDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  FolderKanban,
  Bell,
  CheckCircle,
  Layers3,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getManagerProductUserAnalytics,
  getManagerProductUsers,
  getManagerProjects,
} from "../../services/managerService";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    notifications: 0,
  });

  const [recent, setRecent] = useState([]);
  const [productUsers, setProductUsers] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [projects, productUserList] = await Promise.all([
        getManagerProjects(),
        getManagerProductUsers(),
      ]);
      const analytics = await getManagerProductUserAnalytics();

      const uniqueClients = new Set(
        projects.map((p) => p.clientEmail).filter(Boolean)
      );

      const activeProjects = projects.filter((p) => p.status !== "completed");
      const completedProjects = projects.filter((p) => p.status === "completed");

      setStats({
        totalClients: uniqueClients.size,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        notifications: 0,
      });

      const recentItems = projects.slice(0, 5).map((p) => ({
        id: p._id,
        message: `Project "${p.name}" for ${p.clientName || "Client"}`,
        time: new Date(p.createdAt).toLocaleString(),
      }));

      setRecent(recentItems);
      setProductUsers(Array.isArray(productUserList) ? productUserList : []);
      setProductAnalytics(analytics);
    } catch (err) {
      console.error("Manager dashboard error:", err);
      toast.error("Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p className="muted">Loading dashboard...</p>;
  }

  const activeProductUsers = productUsers.filter(
    (item) => String(item.status || "").toLowerCase() === "active"
  );
  const productWisePayments = productAnalytics?.productWisePayments || [];
  const monthWisePayments = productAnalytics?.monthWisePayments || [];

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Quick insights into your clients, projects, activities, and product users.</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "productUsers" ? "active" : ""}
          onClick={() => setActiveTab("productUsers")}
        >
          Product Users
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
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

          <div className="recent-section">
            <h3>Recent Activity</h3>

            {recent.length === 0 && <p className="muted">No recent activity</p>}

            {recent.map((item) => (
              <div key={item.id} className="recent-card">
                <p>{item.message}</p>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="product-user-dashboard-tab">
          <div className="product-user-dashboard-head">
            <div>
              <h3>Product Users</h3>
              <p>See the product users assigned to you and open their management page.</p>
            </div>
            <button onClick={() => navigate("/manager/product-users")}>
              Open Product Users
            </button>
          </div>

          <div className="product-user-dashboard-stats">
          <div className="product-user-dashboard-stat">
            <div className="stat-icon small">
              <Layers3 size={20} />
            </div>
            <div>
              <strong>{productAnalytics?.summary?.totalUsers ?? productUsers.length}</strong>
              <span>Total Product Users</span>
            </div>
          </div>

            <div className="product-user-dashboard-stat">
            <div className="stat-icon small">
              <Users size={20} />
            </div>
            <div>
              <strong>{productAnalytics?.summary?.activeUsers ?? activeProductUsers.length}</strong>
              <span>Active Product Users</span>
            </div>
          </div>
        </div>

        <div className="product-user-dashboard-charts">
          <div className="recent-card">
            <h3>Product-wise Payment</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productWisePayments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29415c" />
                <XAxis dataKey="productName" hide={productWisePayments.length > 4} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="paidAmount" fill="#ffcb05" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="recent-card">
            <h3>Month-wise Payment</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthWisePayments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29415c" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="paidAmount"
                  stroke="#007bff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="product-user-dashboard-list">
          {productUsers.length === 0 ? (
            <p className="muted">No product users assigned yet.</p>
          ) : (
              productUsers.slice(0, 5).map((item) => (
                <div key={item._id} className="product-user-dashboard-card">
                  <div>
                    <h4>{item.name || item.email}</h4>
                    <p>{item.productName || "No product assigned"}</p>
                  </div>
                  <span>{item.email}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
