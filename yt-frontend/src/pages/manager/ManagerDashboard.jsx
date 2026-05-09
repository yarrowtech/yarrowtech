import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Cell,
} from "recharts";
import {
  LayoutDashboard, Users, FolderKanban, CheckCircle,
  Layers3, Mail, Briefcase, Bell, ArrowRight,
  TrendingUp, BarChart2, Calendar, IndianRupee, UserCheck, Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getManagerProductUserAnalytics,
  getManagerProductUsers,
  getManagerProjects,
} from "../../services/managerService";
import "../../styles/ManagerDashboard.css";

/* ── Recharts custom tooltip ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--erp-bg)", border: "1px solid var(--erp-border)",
      borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "var(--erp-text)",
    }}>
      {label && <p style={{ margin: "0 0 4px", color: "var(--erp-text-muted)" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || "var(--erp-accent)", fontWeight: 700 }}>
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("amount")
            ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
}

const CHART_COLORS = ["#ffcb05", "#60a5fa", "#34d399", "#f87171", "#a855f7"];

const STATUS_COLORS = {
  active:    { color: "#34d399", bg: "rgba(52,211,153,0.15)"  },
  completed: { color: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
  pending:   { color: "#facc15", bg: "rgba(250,204,21,0.15)"  },
  "on-hold": { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
};

const QUICK_ACTIONS = [
  { label: "Manage Projects", icon: FolderKanban, color: "#34d399", bg: "rgba(52,211,153,0.12)",  path: "/manager/projects"       },
  { label: "Create Client",   icon: Users,        color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  path: "/manager/create-client"  },
  { label: "CRM Requests",    icon: Mail,         color: "#a855f7", bg: "rgba(168,85,247,0.12)",  path: "/manager/requests"       },
  { label: "Product Users",   icon: Layers3,      color: "#facc15", bg: "rgba(250,204,21,0.12)",  path: "/manager/product-users"  },
  { label: "Contact Forms",   icon: Mail,         color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  path: "/manager/contacts"       },
  { label: "Career Forms",    icon: Briefcase,    color: "#f97316", bg: "rgba(249,115,22,0.12)",  path: "/manager/careers"        },
  { label: "Notifications",   icon: Bell,         color: "#818cf8", bg: "rgba(129,140,248,0.12)", path: "/manager/notifications"  },
  { label: "Settings",        icon: LayoutDashboard, color: "#fb7185", bg: "rgba(251,113,133,0.12)", path: "/manager/settings"   },
];

const managerName = () => {
  try {
    const name = JSON.parse(localStorage.getItem("erp_user") || "{}").name || "Manager";
    return name.replace(/\b\w/g, (c) => c.toUpperCase());
  } catch { return "Manager"; }
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState("overview");
  const [projects,         setProjects]         = useState([]);
  const [productUsers,     setProductUsers]     = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [projectList, productUserList] = await Promise.all([
        getManagerProjects(),
        getManagerProductUsers(),
      ]);
      const analytics = await getManagerProductUserAnalytics();
      setProjects(Array.isArray(projectList) ? projectList : []);
      setProductUsers(Array.isArray(productUserList) ? productUserList : []);
      setProductAnalytics(analytics);
    } catch (err) {
      console.error("Manager dashboard error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="md-loading">
        <div className="md-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  /* ── Derived stats ── */
  const uniqueClients    = new Set(projects.map((p) => p.clientEmail).filter(Boolean)).size;
  const activeProjects   = projects.filter((p) => p.status !== "completed").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const activeProductUsers = productUsers.filter((u) => String(u.status || "").toLowerCase() === "active");

  /* ── Charts data ── */
  const statusCounts = projects.reduce((acc, p) => {
    const s = p.status || "active";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusChart = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  /* month-wise project creation */
  const monthMap = {};
  projects.forEach((p) => {
    const m = new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthMap[m] = (monthMap[m] || 0) + 1;
  });
  const projectsOverTime = Object.entries(monthMap).slice(-6).map(([month, projects]) => ({ month, projects }));

  const productWisePayments = productAnalytics?.productWisePayments || [];
  const monthWisePayments   = productAnalytics?.monthWisePayments   || [];

  const recentProjects = projects.slice(0, 5);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="md-page">

      {/* ── Header ── */}
      <div className="md-header">
        <div className="md-header-left">
          <div className="md-header-icon"><LayoutDashboard size={24} /></div>
          <div>
            <h2>Manager Dashboard</h2>
            <p>Welcome back, {managerName()} — here's your overview</p>
          </div>
        </div>
        <div className="md-date-chip">
          <Calendar size={14} />
          {today}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="md-tabs">
        <button
          className={`md-tab${activeTab === "overview" ? " md-tab--active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart2 size={15} /> Overview
        </button>
        <button
          className={`md-tab${activeTab === "productUsers" ? " md-tab--active" : ""}`}
          onClick={() => setActiveTab("productUsers")}
        >
          <Layers3 size={15} /> Product Users
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* ── Stat Cards ── */}
          <div className="md-stats">
            <div className="md-stat-card" style={{ borderLeftColor: "#60a5fa" }} onClick={() => navigate("/manager/projects")}>
              <div className="md-stat-icon" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
                <Users size={22} />
              </div>
              <div className="md-stat-body">
                <span>Total Clients</span>
                <strong>{uniqueClients}</strong>
              </div>
            </div>

            <div className="md-stat-card" style={{ borderLeftColor: "#34d399" }} onClick={() => navigate("/manager/projects")}>
              <div className="md-stat-icon" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                <FolderKanban size={22} />
              </div>
              <div className="md-stat-body">
                <span>Active Projects</span>
                <strong>{activeProjects}</strong>
              </div>
            </div>

            <div className="md-stat-card" style={{ borderLeftColor: "#ffcb05" }} onClick={() => navigate("/manager/projects")}>
              <div className="md-stat-icon" style={{ background: "rgba(255,203,5,0.12)", color: "#ffcb05" }}>
                <CheckCircle size={22} />
              </div>
              <div className="md-stat-body">
                <span>Completed</span>
                <strong>{completedProjects}</strong>
              </div>
            </div>

            <div className="md-stat-card" style={{ borderLeftColor: "#a855f7" }} onClick={() => navigate("/manager/product-users")}>
              <div className="md-stat-icon" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                <Layers3 size={22} />
              </div>
              <div className="md-stat-body">
                <span>Product Users</span>
                <strong>{productUsers.length}</strong>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="md-section-label">
            <ArrowRight size={14} /> Quick Navigation
          </div>
          <div className="md-quick-grid">
            {QUICK_ACTIONS.map(({ label, icon: Icon, color, bg, path }) => (
              <div key={label} className="md-quick-card" onClick={() => navigate(path)}>
                <div className="md-quick-icon" style={{ background: bg, color }}>
                  <Icon size={18} />
                </div>
                <span className="md-quick-label">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="md-section-label">
            <TrendingUp size={14} /> Analytics
          </div>
          <div className="md-charts">

            <div className="md-chart-card">
              <div className="md-chart-head">
                <div className="md-chart-head-icon"><BarChart2 size={16} /></div>
                <h3>Projects by Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusChart.map((entry, i) => {
                      const c = STATUS_COLORS[entry.name] || { color: CHART_COLORS[i % CHART_COLORS.length] };
                      return <Cell key={i} fill={c.color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="md-chart-card">
              <div className="md-chart-head">
                <div className="md-chart-head-icon"><TrendingUp size={16} /></div>
                <h3>Projects Created (Monthly)</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={projectsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="projects" stroke="#ffcb05" strokeWidth={3} dot={{ fill: "#ffcb05", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ── Recent Projects ── */}
          <div className="md-section-label">
            <Activity size={14} /> Recent Projects
          </div>

          <div className="md-activity-list">
            {recentProjects.length === 0 ? (
              <div className="md-activity-empty">No projects yet.</div>
            ) : (
              recentProjects.map((p) => {
                const sc = STATUS_COLORS[p.status] || STATUS_COLORS.active;
                return (
                  <div
                    key={p._id}
                    className="md-activity-row"
                    onClick={() => navigate(`/manager/projects/${p._id}`)}
                  >
                    <div className="md-activity-dot" style={{ background: sc.color }} />
                    <div className="md-activity-body">
                      <p>{p.name}</p>
                      <span>{p.clientName || p.clientEmail || "No client"} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    <span
                      className="md-activity-badge"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {p.status}
                    </span>
                    <ArrowRight size={14} style={{ color: "var(--erp-text-faint)", flexShrink: 0 }} />
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* ── Product Users Tab ── */
        <>
          <div className="md-pu-header">
            <div>
              <h3>Product Users</h3>
              <p>Quick view of product-user counts and payment analytics</p>
            </div>
            <button className="md-open-btn" onClick={() => navigate("/manager/product-users")}>
              <Layers3 size={15} /> Open Product Users
            </button>
          </div>

          {/* Summary stats */}
          <div className="md-pu-stats">
            <div className="md-pu-stat">
              <span>Total Product Users</span>
              <strong>{productAnalytics?.summary?.totalUsers ?? productUsers.length}</strong>
            </div>
            <div className="md-pu-stat">
              <span>Active Users</span>
              <strong>{productAnalytics?.summary?.activeUsers ?? activeProductUsers.length}</strong>
            </div>
            <div className="md-pu-stat">
              <span>Total Paid (₹)</span>
              <strong>{(productAnalytics?.summary?.totalPaid || 0).toLocaleString("en-IN")}</strong>
            </div>
          </div>

          {/* Charts */}
          <div className="md-charts">
            <div className="md-chart-card">
              <div className="md-chart-head">
                <div className="md-chart-head-icon"><IndianRupee size={16} /></div>
                <h3>Product-wise Payment</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={productWisePayments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="productName" hide={productWisePayments.length > 4}
                    tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="paidAmount" fill="#ffcb05" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="md-chart-card">
              <div className="md-chart-head">
                <div className="md-chart-head-icon"><TrendingUp size={16} /></div>
                <h3>Month-wise Payment</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthWisePayments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="paidAmount" stroke="#60a5fa" strokeWidth={3} dot={{ fill: "#60a5fa", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent product users */}
          <div className="md-section-label">
            <UserCheck size={14} /> Recent Product Users
          </div>

          <div className="md-pu-list">
            {productUsers.length === 0 ? (
              <div className="md-pu-empty">No product users assigned yet.</div>
            ) : (
              productUsers.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="md-pu-row"
                  onClick={() => navigate(`/manager/product-users/${item._id}`)}
                >
                  <div className="md-pu-avatar">
                    {(item.name || item.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="md-pu-info">
                    <h4>{item.name || item.email}</h4>
                    <p>{item.productName || "No product assigned"}</p>
                  </div>
                  <ArrowRight size={14} style={{ color: "var(--erp-text-faint)", flexShrink: 0 }} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
