import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell as PieCell,
  Legend,
} from "recharts";
import { toast } from "react-hot-toast";

import "../../styles/ClientDashboard.css";
import { clientService } from "../../services/clientService";

const COLORS = ["#ffcb05", "#007bff", "#ff5252", "#00c49f"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await clientService.dashboard();
      const dashboardStats = res?.stats || {};
      const recentProjects = Array.isArray(res?.recentProjects)
        ? res.recentProjects
        : [];
      const statusBreakdown = res?.statusBreakdown || {};

      setStats([
        {
          label: "My Projects",
          value: dashboardStats.totalProjects ?? recentProjects.length,
          isCurrency: false,
        },
        {
          label: "Payments Made",
          value: dashboardStats.paidAmount ?? 0,
          isCurrency: true,
        },
        {
          label: "Pending",
          value: dashboardStats.pendingAmount ?? 0,
          isCurrency: true,
        },
        {
          label: "Yet To Pay",
          value: dashboardStats.dueAmount ?? 0,
          isCurrency: true,
        },
      ]);

      setPieData(
        Object.entries(statusBreakdown).map(([name, value]) => ({
          name,
          value,
        }))
      );

      setBarData(
        recentProjects.length
          ? recentProjects.map((project) => ({
              name: project.projectId || project.name,
              progress: Number(project.progress) || 0,
            }))
          : [{ name: "No Data", progress: 0 }]
      );

      setLineData(
        recentProjects.length
          ? recentProjects.map((project, index) => ({
              step: `Project ${index + 1}`,
              progress: Number(project.progress) || 0,
            }))
          : [{ step: "Project 1", progress: 0 }]
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load client dashboard");
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

  return (
    <div className="client-dashboard-container">
      <div className="client-header">
        <h2>Client Dashboard</h2>
        <p className="subtitle">Overview of your project activity and payment status</p>
      </div>

      <div className="client-stats-grid">
        {stats.map((item) => (
          <div key={item.label} className="client-stat-card">
            <h4>{item.label}</h4>
            <p className="value">
              {item.isCurrency ? formatCurrency(item.value) : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="client-charts-grid">
        <div className="client-chart-box">
          <h3>Project Progress</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress">
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="client-chart-box">
          <h3>Recent Project Trend</h3>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={lineData}>
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#ffcb05"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="client-chart-box">
          <h3>Project Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                label
              >
                {pieData.map((_, i) => (
                  <PieCell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
