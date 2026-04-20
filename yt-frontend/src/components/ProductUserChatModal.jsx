import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import API from "../services/axiosInstance";
import "../styles/ProjectChatModal.css";

export default function ProductUserChatModal({
  productUserId,
  currentRole,
  recipientEmail,
  recipientLabel,
  title,
  onClose,
}) {
  const erpUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("erp_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentEmail = String(erpUser?.email || "").toLowerCase();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/erp/message/product-user/${productUserId}`);
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productUserId) {
      loadMessages();
    }
  }, [productUserId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      setSending(true);
      const res = await API.post("/erp/message/send", {
        productUserId,
        text,
        toEmail: recipientEmail,
        roleTo: currentRole === "manager" || currentRole === "admin" ? "productuser" : "manager",
      });

      const nextMessage = res.data?.message;
      if (nextMessage) {
        setMessages((prev) => [...prev, nextMessage]);
      }
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="project-chat-overlay" onClick={onClose}>
      <div className="project-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-chat-header">
          <div>
            <h3>{title || "Product User Chat"}</h3>
            <p>Conversation with {recipientLabel}</p>
          </div>
          <button type="button" className="project-chat-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="project-chat-body">
          {loading && <p className="project-chat-muted">Loading messages...</p>}
          {!loading && messages.length === 0 && (
            <p className="project-chat-muted">No messages yet. Start the conversation here.</p>
          )}
          {!loading &&
            messages.map((message) => (
              <div
                key={message._id}
                className={`project-chat-bubble ${
                  String(message.fromEmail || "").toLowerCase() === currentEmail
                    ? "mine"
                    : "theirs"
                }`}
              >
                <div className="project-chat-meta">
                  <span>{message.roleFrom || "user"}</span>
                  <span>
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p>{message.text}</p>
              </div>
            ))}
        </div>

        <div className="project-chat-footer">
          <textarea
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
          />
          <div className="project-chat-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Close
            </button>
            <button type="button" className="save-btn" onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
