import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FolderKanban, Search, ArrowRight, User, Mail,
  Activity, CheckCircle2, Clock, Layers,
} from "lucide-react";

import API from "../../services/axiosInstance";
import "../../styles/ManagerProjects.css";

const STATUS_COLORS = {
  pending:   { bg: "rgba(250,204,21,0.15)",  text: "#ca8a04" },
  ongoing:   { bg: "rgba(56,189,248,0.15)",  text: "#0284c7" },
  completed: { bg: "rgba(52,211,153,0.15)",  text: "#059669" },
};

const STATUS_OPTS = ["all", "pending", "ongoing", "completed"];

export default function ManagerProjects() {
  const navigate = useNavigate();
  const [projects,      setProjects]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/erp/projects/manager");
      setProjects(Array.isArray(res.data?.projects) ? res.data.projects : []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.projectId, p.name, p.clientName, p.clientEmail, p.techLeadEmail, p.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, search, statusFilter]);

  const getCount = (status) =>
    status === "all" ? projects.length : projects.filter((p) => p.status === status).length;

  const stats = [
    { label: "Total Projects", value: getCount("all"),       icon: Layers,        color: "#60a5fa" },
    { label: "Ongoing",        value: getCount("ongoing"),   icon: Activity,      color: "#38bdf8" },
    { label: "Completed",      value: getCount("completed"), icon: CheckCircle2,  color: "#34d399" },
    { label: "Pending",        value: getCount("pending"),   icon: Clock,         color: "#facc15" },
  ];

  return (
    <div className="mp-page">

      {/* ── Header ── */}
      <div className="mp-header">
        <div className="mp-header-icon">
          <FolderKanban size={24} />
        </div>
        <div>
          <h2>Manage Projects</h2>
          <p>Overview of all client projects under your management</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="mp-stats">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`mp-stat-card${statusFilter === s.label.toLowerCase().replace("total projects", "all").replace(" ", "-") ? " active" : ""}`}
            onClick={() => setStatusFilter(
              s.label === "Total Projects" ? "all"
              : s.label.toLowerCase().replace(" ", "-") === "in-progress" ? "ongoing"
              : s.label.toLowerCase()
            )}
          >
            <div className="mp-stat-icon" style={{ color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="mp-stat-body">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mp-toolbar">
        <div className="mp-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search project, client, email, tech lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mp-status-tabs">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              className={`mp-tab${statusFilter === s ? " mp-tab--active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="mp-loading">
          <div className="mp-spinner" />
          <span>Loading projects...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mp-empty">
          <FolderKanban size={44} />
          <p>{projects.length === 0 ? "No projects found." : "No projects match your search."}</p>
        </div>
      ) : (
        <div className="mp-list" role="table" aria-label="Projects">
          <div className="mp-list-head" role="row">
            <span role="columnheader">Project</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Tech Lead</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Progress</span>
            <span role="columnheader" className="mp-sr-only">Action</span>
          </div>

          {filtered.map((project) => {
            const sc = STATUS_COLORS[project.status] || STATUS_COLORS.pending;
            const progress = Number(project.progress) || 0;
            const open = () => navigate(`/manager/projects/${project._id}`);

            return (
              <div
                key={project._id}
                className="mp-row"
                role="row"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => { if (e.key === "Enter") open(); }}
              >
                <div className="mp-cell mp-cell-project" role="cell">
                  <div className="mp-card-icon"><FolderKanban size={16} /></div>
                  <div className="mp-cell-text">
                    <strong title={project.name}>{project.name}</strong>
                    <span className="mp-project-id">{project.projectId}</span>
                  </div>
                </div>

                <div className="mp-cell" role="cell">
                  <div className="mp-cell-text">
                    <span className="mp-cell-label"><User size={12} /> Client</span>
                    <strong>{project.clientName || "—"}</strong>
                    <span className="mp-cell-sub"><Mail size={12} /> {project.clientEmail || "—"}</span>
                  </div>
                </div>

                <div className="mp-cell" role="cell">
                  <div className="mp-cell-text">
                    <span className="mp-cell-label"><Activity size={12} /> Tech Lead</span>
                    <span className="mp-cell-value">{project.techLeadEmail || "—"}</span>
                  </div>
                </div>

                <div className="mp-cell" role="cell">
                  <span
                    className="mp-status-badge"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {project.status || "pending"}
                  </span>
                </div>

                <div className="mp-cell mp-cell-progress" role="cell">
                  <div className="mp-progress-bar">
                    <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="mp-progress-pct">{progress}%</span>
                </div>

                <div className="mp-cell mp-cell-action" role="cell">
                  <button
                    type="button"
                    className="mp-row-open"
                    onClick={(e) => { e.stopPropagation(); open(); }}
                  >
                    Open <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
