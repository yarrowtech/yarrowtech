import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LayoutDashboard, Users, FolderKanban, MessageSquare,
  Briefcase, Mail, Package, FileText, Bell,
  TrendingUp, Activity, BarChart2, Calendar,
  ArrowRight, UserCheck, IndianRupee,
} from "lucide-react";
import {
  getAdminStats,
  getProductUserAnalytics,
  getProductUsers,
} from "../../services/adminService";
import "../../styles/AdminDashboard.css";

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

const QUICK_ACTIONS = [
  { label: "Users",          icon: Users,          color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  path: "/admin/users"         },
  { label: "Projects",       icon: FolderKanban,   color: "#34d399", bg: "rgba(52,211,153,0.12)",  path: "/admin/projects"      },
  { label: "Demo Requests",  icon: MessageSquare,  color: "#a855f7", bg: "rgba(168,85,247,0.12)",  path: "/admin/requests"      },
  { label: "Career Forms",   icon: Briefcase,      color: "#f97316", bg: "rgba(249,115,22,0.12)",  path: "/admin/careers"       },
  { label: "Contact Forms",  icon: Mail,           color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  path: "/admin/contacts"      },
  { label: "Product Users",  icon: Package,        color: "#facc15", bg: "rgba(250,204,21,0.12)",  path: "/admin/product-users" },
  { label: "Blog",           icon: FileText,       color: "#fb7185", bg: "rgba(251,113,133,0.12)", path: "/admin/blogs"         },
  { label: "Notifications",  icon: Bell,           color: "#818cf8", bg: "rgba(129,140,248,0.12)", path: "/admin/notifications" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats,            setStats]            = useState(null);
  const [productUsers,     setProductUsers]     = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState("overview");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [data, productUserList] = await Promise.all([getAdminStats(), getProductUsers()]);
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

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const activeProductUsers   = productUsers.filter((u) => String(u.status || "").toLowerCase() === "active");
  const recentProductUsers   = productUsers.slice(0, 5);
  const productWisePayments  = productAnalytics?.productWisePayments  || [];
  const monthWisePayments    = productAnalytics?.monthWisePayments    || [];

  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const statCards = stats?.topCards?.map((item, i) => {
    const icons    = [FolderKanban, Users, MessageSquare, Mail];
    const colors   = ["#60a5fa", "#34d399", "#a855f7", "#facc15"];
    const bgColors = ["rgba(96,165,250,0.12)", "rgba(52,211,153,0.12)", "rgba(168,85,247,0.12)", "rgba(250,204,21,0.12)"];
    const paths    = ["/admin/projects", "/admin/users", "/admin/requests", "/admin/contacts"];
    return { ...item, Icon: icons[i] || Activity, color: colors[i], bg: bgColors[i], path: paths[i] };
  }) ?? [];

  return (
    <div className="ad-page">

      {/* ── Header ── */}
      <div className="ad-header">
        <div className="ad-header-left">
          <div className="ad-header-icon"><LayoutDashboard size={24} /></div>
          <div>
            <h2>Admin Dashboard</h2>
            <p>Insights, analytics and activity overview</p>
          </div>
        </div>
        <div className="ad-date-chip">
          <Calendar size={14} />
          {today}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ad-tabs">
        <button
          className={`ad-tab${activeTab === "overview" ? " ad-tab--active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart2 size={15} /> Overview
        </button>
        <button
          className={`ad-tab${activeTab === "productUsers" ? " ad-tab--active" : ""}`}
          onClick={() => setActiveTab("productUsers")}
        >
          <Package size={15} /> Product Users
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* ── Stat Cards ── */}
          <div className="ad-stats">
            {statCards.map(({ label, value, Icon, color, bg, path }) => (
              <div
                key={label}
                className="ad-stat-card"
                style={{ borderLeftColor: color }}
                onClick={() => navigate(path)}
              >
                <div className="ad-stat-icon" style={{ background: bg, color }}>
                  <Icon size={22} />
                </div>
                <div className="ad-stat-body">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <div className="ad-section-label">
            <ArrowRight size={14} /> Quick Navigation
          </div>
          <div className="ad-quick-grid">
            {QUICK_ACTIONS.map(({ label, icon: Icon, color, bg, path }) => (
              <div
                key={label}
                className="ad-quick-card"
                onClick={() => navigate(path)}
              >
                <div className="ad-quick-icon" style={{ background: bg, color }}>
                  <Icon size={18} />
                </div>
                <span className="ad-quick-label">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="ad-section-label">
            <TrendingUp size={14} /> Analytics
          </div>
          <div className="ad-charts">

            <div className="ad-chart-card">
              <div className="ad-chart-head">
                <div className="ad-chart-head-icon"><BarChart2 size={16} /></div>
                <h3>Demo Requests (Monthly)</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats?.demoChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                    {(stats?.demoChart ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ad-chart-card">
              <div className="ad-chart-head">
                <div className="ad-chart-head-icon"><TrendingUp size={16} /></div>
                <h3>User Growth Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats?.userGrowth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" stroke="#ffcb05" strokeWidth={3} dot={{ fill: "#ffcb05", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="ad-chart-card ad-chart-card--wide">
              <div className="ad-chart-head">
                <div className="ad-chart-head-icon"><Activity size={16} /></div>
                <h3>Project Status Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats?.projectDistribution ?? []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.projectDistribution ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      ) : (
        /* ── Product Users Tab ── */
        <>
          <div className="ad-pu-header">
            <div>
              <h3>Product Users</h3>
              <p>Quick view of product-user counts and payment analytics</p>
            </div>
            <button className="ad-open-btn" onClick={() => navigate("/admin/product-users")}>
              <Package size={15} /> Open Product Users
            </button>
          </div>

          {/* Summary stats */}
          <div className="ad-pu-stats">
            <div className="ad-pu-stat">
              <span>Total Product Users</span>
              <strong>{productAnalytics?.summary?.totalUsers ?? productUsers.length}</strong>
            </div>
            <div className="ad-pu-stat">
              <span>Active Users</span>
              <strong>{productAnalytics?.summary?.activeUsers ?? activeProductUsers.length}</strong>
            </div>
            <div className="ad-pu-stat">
              <span>Total Paid (₹)</span>
              <strong>{(productAnalytics?.summary?.totalPaid || 0).toLocaleString("en-IN")}</strong>
            </div>
          </div>

          {/* Charts */}
          <div className="ad-charts">
            <div className="ad-chart-card">
              <div className="ad-chart-head">
                <div className="ad-chart-head-icon"><IndianRupee size={16} /></div>
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

            <div className="ad-chart-card">
              <div className="ad-chart-head">
                <div className="ad-chart-head-icon"><TrendingUp size={16} /></div>
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
          <div className="ad-section-label">
            <UserCheck size={14} /> Recent Product Users
          </div>

          <div className="ad-pu-list">
            {recentProductUsers.length === 0 ? (
              <div className="ad-pu-empty">No product users created yet.</div>
            ) : (
              recentProductUsers.map((item) => (
                <div
                  key={item._id}
                  className="ad-pu-row"
                  onClick={() => navigate(`/admin/product-users/${item._id}`)}
                >
                  <div className="ad-pu-avatar">
                    {(item.name || item.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="ad-pu-info">
                    <h4>{item.name || item.email}</h4>
                    <p>{item.productName || "No product assigned"}</p>
                  </div>
                  <span className="ad-pu-manager">
                    {item.manager?.name || item.managerEmail || "—"}
                  </span>
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
