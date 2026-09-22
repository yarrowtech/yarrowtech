import React, { useEffect, useMemo, useState } from "react";
import "../../styles/ContactsAdmin.css";
import { getContacts } from "../../services/adminService";
import {
  Search, Eye, X, Mail, MessageSquare, CalendarDays, Users, Reply,
} from "lucide-react";

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.contacts)
        ? data.contacts
        : [];
      setContacts(list);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const s = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.message?.toLowerCase().includes(s)
    );
  }, [searchTerm, contacts]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const today = contacts.filter((c) => isSameDay(new Date(c.createdAt), now)).length;
    const thisWeek = contacts.filter((c) => new Date(c.createdAt) >= weekAgo).length;

    return [
      { label: "Total Messages", value: contacts.length, icon: MessageSquare, color: "#60a5fa" },
      { label: "Today",          value: today,           icon: CalendarDays, color: "#facc15" },
      { label: "This Week",      value: thisWeek,        icon: Users,        color: "#34d399" },
    ];
  }, [contacts]);

  return (
    <div className="ca-page">

      {/* ── Header ── */}
      <div className="ca-header">
        <div className="ca-header-icon">
          <Mail size={24} />
        </div>
        <div>
          <h2>Contact Messages</h2>
          <p>View all messages submitted through the website</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ca-stats">
        {stats.map((s) => (
          <div className="ca-stat-card" key={s.label}>
            <div className="ca-stat-icon" style={{ color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="ca-stat-body">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="ca-toolbar">
        <div className="ca-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ca-count-chip">Total: {filtered.length}</div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="ca-skeleton-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ca-skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="ca-table-wrap">
          <table className="ca-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Received</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="ca-empty">
                    <MessageSquare size={36} />
                    <p>No contact messages found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="ca-name-cell">
                        <div className="ca-avatar">
                          {c.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="ca-name">{c.name}</span>
                      </div>
                    </td>
                    <td><span className="ca-email">{c.email}</span></td>
                    <td>
                      <span className="ca-message-preview" title={c.message}>
                        {c.message}
                      </span>
                    </td>
                    <td>
                      <div className="ca-date-cell">
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        <small>
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ca-view-btn"
                        onClick={() => setSelectedContact(c)}
                      >
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedContact && (
        <div className="ca-modal-backdrop" onClick={() => setSelectedContact(null)}>
          <div className="ca-modal" onClick={(e) => e.stopPropagation()}>

            <div className="ca-modal-head">
              <div className="ca-modal-avatar">
                {selectedContact.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="ca-modal-title">
                <p className="ca-modal-label">Message Details</p>
                <h3>{selectedContact.name}</h3>
              </div>
              <button
                type="button"
                className="ca-modal-close"
                onClick={() => setSelectedContact(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ca-modal-grid">
              <div className="ca-info-card">
                <div className="ca-info-icon"><Mail size={15} /></div>
                <div>
                  <span>Email</span>
                  <strong>{selectedContact.email}</strong>
                </div>
              </div>
              <div className="ca-info-card">
                <div className="ca-info-icon"><CalendarDays size={15} /></div>
                <div>
                  <span>Received</span>
                  <strong>{new Date(selectedContact.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="ca-message-panel">
              <p className="ca-message-label"><MessageSquare size={14} /> Message</p>
              <div className="ca-message-body">
                {selectedContact.message}
              </div>
            </div>

            <div className="ca-modal-actions">
              <a className="ca-reply-btn" href={`mailto:${selectedContact.email}`}>
                <Reply size={15} /> Reply by Email
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
