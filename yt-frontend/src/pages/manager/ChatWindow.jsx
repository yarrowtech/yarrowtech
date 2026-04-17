import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import API from "../../services/axiosInstance";
import "../../styles/ManagerChatWindow.css";

export default function ChatWindow({ project, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);

  const currentUser =
    JSON.parse(localStorage.getItem("erp_user")) ||
    JSON.parse(localStorage.getItem("erpUser") || "null");

  const clientEmail = project?.clientEmail || "";
  const projectId = project?._id || project?.id || "";

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    const loadMessages = async () => {
      try {
        const res = await API.get(`/erp/message/project/${projectId}`);
        if (active) {
          setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
        }
      } catch (err) {
        console.error("CHAT LOAD ERROR:", err);
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!currentUser?.email) return;

    const socketBaseUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
      "http://localhost:5000";

    const socket = io(socketBaseUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", currentUser.email);
    });

    socket.on("new-message", (msg) => {
      if ((msg?.projectId || msg?.project) === projectId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection failed:", err.message);
    });

    return () => {
      socket.off("new-message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.email, projectId]);

  const sendMessage = async () => {
    if (!text.trim() || !projectId || !clientEmail) return;

    try {
      const res = await API.post("/erp/message/send", {
        projectId,
        text,
        toEmail: clientEmail,
      });

      const msg = res.data?.message;
      if (!msg) return;

      setMessages((prev) => [...prev, msg]);
      socketRef.current?.emit("send-message", msg);
      setText("");
    } catch (err) {
      console.error("CHAT SEND ERROR:", err);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <div className="chat-overlay">
      <div className="chat-box">
        <div className="chat-header">
          <h3>Chat with {project.clientName || "Client"}</h3>
          <button onClick={onClose}>x</button>
        </div>

        <div className="chat-body">
          {messages.map((m) => (
            <div
              key={m._id || `${m.fromEmail}-${m.createdAt}`}
              className={`chat-msg ${
                m.fromEmail === currentUser?.email ? "right" : "left"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="chat-footer">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
