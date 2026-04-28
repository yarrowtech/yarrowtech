import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Bell, BriefcaseBusiness, MessageSquare, FolderKanban,
  RefreshCw, CreditCard, Settings, ArrowRight,
} from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from "../services/notificationService";
import "../styles/NotificationBell.css";

const TYPE_ICONS = {
  career_application: BriefcaseBusiness,
  demo_request:       MessageSquare,
  project_created:    FolderKanban,
  project_updated:    RefreshCw,
  payment_added:      CreditCard,
  system:             Settings,
};

const TYPE_EMOJI = {
  career_application: "💼",
  demo_request:       "📩",
  project_created:    "🗂️",
  project_updated:    "🔄",
  payment_added:      "💳",
  system:             "🔔",
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell({ viewAllPath = "/manager/notifications" }) {
  const navigate  = useNavigate();
  const wrapRef   = useRef(null);
  const prevCount = useRef(null);   // track last known unread count for diff

  const [open,    setOpen]    = useState(false);
  const [items,   setItems]   = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);

  /* ── fetch unread count + show toasts for NEW arrivals ── */
  const fetchCount = useCallback(async () => {
    try {
      const data  = await getUnreadCount();
      const count = data.count ?? 0;

      /* If count grew since last poll, fetch new items and toast each one */
      if (prevCount.current !== null && count > prevCount.current) {
        const diff = count - prevCount.current;
        try {
          const newest = await getNotifications({ limit: diff, page: 1 });
          const fresh  = (newest.notifications ?? []).filter((n) => !n.isRead);
          fresh.forEach((n) => {
            const emoji = TYPE_EMOJI[n.type] || "🔔";
            toast(
              (t) => (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 3 }}>
                    {emoji} {n.title}
                  </strong>
                  {n.message && (
                    <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>
                      {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
                    </span>
                  )}
                </div>
              ),
              { duration: 5000, icon: null }
            );
          });
        } catch { /* ignore toast fetch errors */ }
      }

      prevCount.current = count;
      setUnread(count);
    } catch { /* ignore */ }
  }, [navigate]);

  /* ── fetch dropdown items when opened ── */
  const fetchDropdown = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 10 });
      setItems(data.notifications ?? []);
      const c = (data.notifications ?? []).filter((n) => !n.isRead).length;
      setUnread(c);
      prevCount.current = c;
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  /* Poll every 30 s */
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [fetchCount]);

  /* Fetch list when dropdown opens */
  useEffect(() => {
    if (open) fetchDropdown();
  }, [open, fetchDropdown]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      await markRead(item._id).catch(() => {});
      setItems((prev) => prev.map((n) => n._id === item._id ? { ...n, isRead: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    }
    if (item.link) { navigate(item.link); setOpen(false); }
  };

  const handleMarkAll = async () => {
    await markAllRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    prevCount.current = 0;
  };

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button className="nb-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="nb-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          {/* Header */}
          <div className="nb-head">
            <div className="nb-head-title">
              <Bell size={15} />
              Notifications
              {unread > 0 && <span className="nb-unread-chip">{unread} new</span>}
            </div>
            {unread > 0 && (
              <button className="nb-mark-all-btn" onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="nb-list">
            {loading ? (
              <div className="nb-empty"><Bell size={32} /><span>Loading...</span></div>
            ) : items.length === 0 ? (
              <div className="nb-empty"><Bell size={32} /><span>No notifications yet</span></div>
            ) : (
              items.map((item) => {
                const Icon = TYPE_ICONS[item.type] || Settings;
                return (
                  <div
                    key={item._id}
                    className={`nb-item${!item.isRead ? " nb-item--unread" : ""}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className={`nb-icon nb-icon--${item.type}`}>
                      <Icon size={16} />
                    </div>
                    <div className="nb-body">
                      <div className="nb-body-title">{item.title}</div>
                      {item.message && <div className="nb-body-msg">{item.message}</div>}
                      <div className="nb-body-time">{timeAgo(item.createdAt)}</div>
                    </div>
                    {!item.isRead && <div className="nb-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="nb-footer">
            <button
              className="nb-view-all"
              onClick={() => { navigate(viewAllPath); setOpen(false); }}
            >
              View all notifications <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
