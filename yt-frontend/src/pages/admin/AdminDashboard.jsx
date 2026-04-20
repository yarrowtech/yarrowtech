import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getAdminStats,
  getProductUserAnalytics,
  getProductUsers,
} from "../../services/adminService";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [productUsers, setProductUsers] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = ["#ffcb05", "#007bff", "#ff5252"];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [data, productUserList] = await Promise.all([
        getAdminStats(),
        getProductUsers(),
      ]);
      setStats(data);
      setProductUsers(Array.isArray(productUserList) ? productUserList : []);
      const analytics = await getProductUserAnalytics();
      setProductAnalytics(analytics);
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading dashboard...</p>;

  const activeProductUsers = productUsers.filter(
    (item) => String(item.status || "").toLowerCase() === "active"
  );
  const recentProductUsers = productUsers.slice(0, 5);
  const productWisePayments = productAnalytics?.productWisePayments || [];
  const monthWisePayments = productAnalytics?.monthWisePayments || [];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>Dashboard Overview</h2>
        <p className="subtitle">Insights, analytics, and product user activity for admins.</p>
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
          <div className="top-stats-grid">
            {stats.topCards.map((item) => (
              <div key={item.label} className="stat-card">
                <h4>{item.label}</h4>
                <p className="value">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <div className="chart-box">
              <h3>Demo Requests (Monthly)</h3>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={stats.demoChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#29415c" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests">
                    {stats.demoChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>User Growth Trend</h3>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={stats.userGrowth}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#ffcb05"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Projects Status Distribution</h3>
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={stats.projectDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    label
                  >
                    {stats.projectDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-product-tab">
          <div className="dashboard-product-tab-head">
            <div>
              <h3>Product Users</h3>
              <p>Quick view of product-user counts and recent assignments.</p>
            </div>
            <button onClick={() => navigate("/admin/product-users")}>
              Open Product Users
            </button>
          </div>

        <div className="dashboard-product-stats">
          <div className="dashboard-product-stat">
            <span>Total Product Users</span>
            <strong>{productAnalytics?.summary?.totalUsers ?? productUsers.length}</strong>
          </div>
          <div className="dashboard-product-stat">
            <span>Active Product Users</span>
            <strong>{productAnalytics?.summary?.activeUsers ?? activeProductUsers.length}</strong>
          </div>
          <div className="dashboard-product-stat">
            <span>Total Paid</span>
            <strong>{Math.round(productAnalytics?.summary?.totalPaid || 0)}</strong>
          </div>
        </div>

        <div className="dashboard-product-charts">
          <div className="chart-box">
            <h3>Product-wise Payment</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productWisePayments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29415c" />
                <XAxis dataKey="productName" hide={productWisePayments.length > 4} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="paidAmount" fill="#ffcb05" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Month-wise Payment</h3>
            <ResponsiveContainer width="100%" height={260}>
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

        <div className="dashboard-product-list">
          {recentProductUsers.length === 0 ? (
            <p className="dashboard-product-empty">No product users created yet.</p>
          ) : (
              recentProductUsers.map((item) => (
                <div key={item._id} className="dashboard-product-card">
                  <div>
                    <h4>{item.name || item.email}</h4>
                    <p>{item.productName || "No product assigned"}</p>
                  </div>
                  <span>{item.manager?.name || item.managerEmail || "-"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
