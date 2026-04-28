import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Bell, BriefcaseBusiness, CheckCheck, CreditCard,
  FolderKanban, MessageSquare, RefreshCw, Send, Settings, Users,
} from "lucide-react";
import {
  getNotifications,
  markAllRead,
  markRead,
  sendNotification,
} from "../../services/notificationService";
import "../../styles/Notifications.css";

const TYPE_META = {
  career_application: { label: "Career",  Icon: BriefcaseBusiness },
  demo_request:       { label: "Demo",    Icon: MessageSquare },
  project_created:    { label: "Project", Icon: FolderKanban },
  project_updated:    { label: "Update",  Icon: RefreshCw },
  payment_added:      { label: "Payment", Icon: CreditCard },
  system:             { label: "System",  Icon: Settings },
};

const FILTERS = ["all", "unread", "read"];

const ROLE_OPTIONS = [
  { value: "admin",      label: "All Admins" },
  { value: "manager",    label: "All Managers" },
  { value: "techlead",   label: "All Tech Leads" },
  { value: "client",     label: "All Clients" },
  { value: "productuser",label: "All Product Users" },
];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)     return "Just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

const userRole = () => {
  try { return JSON.parse(localStorage.getItem("erp_user"))?.role || ""; }
  catch { return ""; }
};

const EMPTY_COMPOSE = { targetType: "role", target: "manager", title: "", message: "", link: "" };

export default function Notifications() {
  const navigate = useNavigate();
  const role = userRole();
  const canSend = role === "admin" || role === "manager";

  const [items,       setItems]       = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [marking,     setMarking]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);

  /* Compose form */
  const [compose,  setCompose]  = useState(EMPTY_COMPOSE);
  const [sending,  setSending]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  const LIMIT = 20;

  const load = useCallback(async (pageNum = 1, replace = true) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: pageNum, limit: LIMIT };
      if (filter === "unread") params.unread = "true";
      const data = await getNotifications(params);
      const list = data.notifications ?? [];
      setItems((prev) => (replace ? list : [...prev, ...list]));
      setHasMore(list.length === LIMIT);
      setPage(pageNum);
    } catch { /* ignore */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [filter]);

  useEffect(() => { load(1, true); }, [load]);

  const handleMarkAll = async () => {
    setMarking(true);
    await markAllRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
    toast.success("All notifications marked as read");
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      await markRead(item._id).catch(() => {});
      setItems((prev) => prev.map((n) => n._id === item._id ? { ...n, isRead: true } : n));
    }
    if (item.link) navigate(item.link);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!compose.title.trim()) { toast.error("Title is required"); return; }
    setSending(true);
    try {
      const res = await sendNotification(compose);
      toast.success(`Notification sent to ${res.sent} recipient${res.sent !== 1 ? "s" : ""}`);
      setCompose(EMPTY_COMPOSE);
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const displayed = filter === "read"
    ? items.filter((n) => n.isRead)
    : filter === "unread"
    ? items.filter((n) => !n.isRead)
    : items;

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="nf-page">

      {/* ── Header ── */}
      <div className="nf-header">
        <div className="nf-header-left">
          <div className="nf-header-icon"><Bell size={24} /></div>
          <div>
            <h2>Notifications</h2>
            <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {unreadCount > 0 && (
            <button className="nf-mark-all-btn" onClick={handleMarkAll} disabled={marking}>
              <CheckCheck size={15} />
              {marking ? "Marking..." : "Mark all as read"}
            </button>
          )}
          {canSend && (
            <button
              className="nf-mark-all-btn"
              style={{ background: "var(--erp-bg-hover)", color: "var(--erp-accent)", border: "1px solid var(--erp-border-med)" }}
              onClick={() => setShowForm((v) => !v)}
            >
              <Send size={15} />
              {showForm ? "Cancel" : "Send Notification"}
            </button>
          )}
        </div>
      </div>

      {/* ── Compose Form (admin / manager only) ── */}
      {canSend && showForm && (
        <form className="nf-compose-card" onSubmit={handleSend}>
          <div className="nf-compose-head">
            <Users size={16} />
            Compose &amp; Send Notification
          </div>

          <div className="nf-compose-grid">
            {/* Target type */}
            <div className="nf-compose-field">
              <label>Send to</label>
              <select
                value={compose.targetType}
                onChange={(e) => setCompose({ ...compose, targetType: e.target.value, target: e.target.value === "role" ? "manager" : "" })}
              >
                <option value="role">Role (group)</option>
                <option value="email">Specific Email</option>
              </select>
            </div>

            {/* Target value */}
            <div className="nf-compose-field">
              <label>{compose.targetType === "role" ? "Role" : "Email Address"}</label>
              {compose.targetType === "role" ? (
                <select
                  value={compose.target}
                  onChange={(e) => setCompose({ ...compose, target: e.target.value })}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={compose.target}
                  onChange={(e) => setCompose({ ...compose, target: e.target.value })}
                  required
                />
              )}
            </div>

            {/* Title */}
            <div className="nf-compose-field">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Notification title"
                value={compose.title}
                onChange={(e) => setCompose({ ...compose, title: e.target.value })}
                required
              />
            </div>

            {/* Link */}
            <div className="nf-compose-field">
              <label>Link (optional)</label>
              <input
                type="text"
                placeholder="/manager/projects"
                value={compose.link}
                onChange={(e) => setCompose({ ...compose, link: e.target.value })}
              />
            </div>

            {/* Message — full width */}
            <div className="nf-compose-field nf-compose-field--wide">
              <label>Message (optional)</label>
              <textarea
                rows="3"
                placeholder="Write a message for the recipient..."
                value={compose.message}
                onChange={(e) => setCompose({ ...compose, message: e.target.value })}
              />
            </div>
          </div>

          <div className="nf-compose-actions">
            <button className="nf-mark-all-btn" type="submit" disabled={sending}>
              <Send size={15} />
              {sending ? "Sending..." : "Send Now"}
            </button>
          </div>
        </form>
      )}

      {/* ── Filter tabs ── */}
      <div className="nf-toolbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`nf-filter-btn${filter === f ? " nf-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Notification List ── */}
      {loading ? (
        <div className="nf-loading">
          <div className="nf-spinner" />
          <span>Loading notifications...</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="nf-empty">
          <Bell size={48} />
          <p>{filter === "unread" ? "No unread notifications." : "No notifications yet."}</p>
        </div>
      ) : (
        <>
          <div className="nf-list">
            {displayed.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.system;
              const { Icon } = meta;
              return (
                <div
                  key={item._id}
                  className={`nf-card${!item.isRead ? " nf-card--unread" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`nf-type-icon nf-type-icon--${item.type}`}>
                    <Icon size={20} />
                  </div>
                  <div className="nf-card-body">
                    <div className="nf-card-title">{item.title}</div>
                    {item.message && <div className="nf-card-msg">{item.message}</div>}
                    <div className="nf-card-meta">
                      <span className="nf-card-time">{timeAgo(item.createdAt)}</span>
                      <span className="nf-card-type-chip">{meta.label}</span>
                    </div>
                  </div>
                  {!item.isRead && <div className="nf-card-dot" />}
                </div>
              );
            })}
          </div>

          {hasMore && filter === "all" && (
            <div className="nf-load-more">
              <button
                className="nf-load-more-btn"
                onClick={() => load(page + 1, false)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
