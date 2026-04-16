import React, { useEffect, useState } from "react";
import API from "../../services/axiosInstance";
import { io } from "socket.io-client";
import "../../styles/ManagerChatWindow.css"; 

const socket = io("http://localhost:5000");

export default function ChatWindow({ project, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const clientEmail = project.clientEmail; // coming from project
  const user = JSON.parse(localStorage.getItem("erpUser"));

  // Register ERP user
  useEffect(() => {
    socket.emit("register", user.email);
  }, []);

  // Load old messages
  useEffect(() => {
    loadMessages();

    socket.on("new-message", (msg) => {
      if (msg.project === project._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [project]);

  const loadMessages = async () => {
    const res = await API.get(`/erp/message/${project._id}`);
    setMessages(res.data.messages);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const msgBody = {
      projectId: project._id,
      text,
      toEmail: clientEmail,
    };

    const res = await API.post("/erp/message/send", msgBody);
    const msg = res.data.message;

    setMessages((prev) => [...prev, msg]);
    socket.emit("send-message", msg);

    setText("");
  };

  return (
    <div className="chat-overlay">
      <div className="chat-box">
        <div className="chat-header">
          <h3>Chat with {project.clientName}</h3>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="chat-body">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`chat-msg ${
                m.fromEmail === user.email ? "right" : "left"
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
