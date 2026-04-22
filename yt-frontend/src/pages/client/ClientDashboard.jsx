import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LineChart, Line, PieChart, Pie, Legend,
} from "recharts";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard, FolderKanban, CheckCircle2, Clock, AlertCircle,
  TrendingUp, BarChart2, PieChart as PieIcon,
} from "lucide-react";

import "../../styles/ClientDashboard.css";
import { clientService } from "../../services/clientService";

const COLORS = ["#ffcb05", "#3b82f6", "#ef4444", "#22c55e", "#a855f7"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="cd-tooltip">
      <p className="cd-tooltip-label">{label}</p>
      <p className="cd-tooltip-value">{payload[0].value}%</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="cd-tooltip">
      <p className="cd-tooltip-label">{label}</p>
      <p className="cd-tooltip-value">{payload[0].value}%</p>
    </div>
  );
};

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData,  setPieData]  = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await clientService.dashboard();
      const s  = res?.stats || {};
      const rp = Array.isArray(res?.recentProjects) ? res.recentProjects : [];
      const sb = res?.statusBreakdown || {};

      setStats([
        { label: "My Projects",    value: s.totalProjects ?? rp.length, icon: FolderKanban,  isCurrency: false, accent: "#3b82f6" },
        { label: "Payments Made",  value: s.paidAmount   ?? 0,          icon: CheckCircle2,  isCurrency: true,  accent: "#22c55e" },
        { label: "Pending",        value: s.pendingAmount ?? 0,          icon: Clock,         isCurrency: true,  accent: "#f59e0b" },
        { label: "Yet To Pay",     value: s.dueAmount     ?? 0,          icon: AlertCircle,   isCurrency: true,  accent: "#ef4444" },
      ]);

      setPieData(Object.entries(sb).map(([name, value]) => ({ name, value })));

      setBarData(
        rp.length
          ? rp.map((p) => ({ name: p.projectId || p.name, progress: Number(p.progress) || 0 }))
          : [{ name: "No Data", progress: 0 }]
      );

      setLineData(
        rp.length
          ? rp.map((p, i) => ({ step: `P${i + 1}`, progress: Number(p.progress) || 0 }))
          : [{ step: "P1", progress: 0 }]
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading">
          <div className="cd-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">

      {/* ── Header ── */}
      <div className="cd-header">
        <div className="cd-header-icon">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h2>Client Dashboard</h2>
          <p>Overview of your project activity and payment status</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cd-stats">
        {stats.map((s) => (
          <div className="cd-stat-card" key={s.label} style={{ borderLeftColor: s.accent }}>
            <div className="cd-stat-icon" style={{ color: s.accent }}>
              <s.icon size={22} />
            </div>
            <div className="cd-stat-body">
              <span>{s.label}</span>
              <strong>{s.isCurrency ? formatCurrency(s.value) : s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="cd-charts">

        {/* Bar Chart */}
        <div className="cd-chart-card">
          <div className="cd-chart-head">
            <div className="cd-chart-head-icon"><BarChart2 size={18} /></div>
            <div>
              <h3>Project Progress</h3>
              <p>Completion % per project</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "var(--erp-bg-hover)" }} />
              <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="cd-chart-card">
          <div className="cd-chart-head">
            <div className="cd-chart-head-icon"><TrendingUp size={18} /></div>
            <div>
              <h3>Progress Trend</h3>
              <p>Progress across recent projects</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border)" vertical={false} />
              <XAxis dataKey="step" tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--erp-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#ffcb05"
                strokeWidth={3}
                dot={{ fill: "#ffcb05", r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "#ffcb05" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="cd-chart-card">
          <div className="cd-chart-head">
            <div className="cd-chart-head-icon"><PieIcon size={18} /></div>
            <div>
              <h3>Status Breakdown</h3>
              <p>Projects by current status</p>
            </div>
          </div>
          {pieData.length === 0 ? (
            <div className="cd-chart-empty">No status data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ color: "var(--erp-text-muted)", fontSize: "0.82rem" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
