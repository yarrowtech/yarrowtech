import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import ProductUserChatModal from "../../components/ProductUserChatModal";
import "../../styles/ProductUserManagement.css";

export default function ProductUserManagement({
  title,
  subtitle,
  loadItems,
  basePath,
  currentRole,
  allowChat = true,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await loadItems());
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load product users");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="product-user-page">
      <div className="product-user-page-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="product-user-count">Total: {items.length}</div>
      </div>

      <div className="product-user-table-wrap">
        <table className="product-user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Product Name</th>
              <th>Manager</th>
              <th>Status</th>
              <th>View</th>
              {allowChat && <th>Chat</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={allowChat ? 6 : 5} className="empty-table-cell">Loading product users...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={allowChat ? 6 : 5} className="empty-table-cell">No product users found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name || "-"}</td>
                  <td>{item.productName || "-"}</td>
                  <td>{item.manager?.name || item.managerEmail || "-"}</td>
                  <td>
                    <span className={`product-user-status ${item.status || "active"}`}>
                      {item.status || "active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => navigate(`${basePath}/${item._id}`)}
                    >
                      View
                    </button>
                  </td>
                  {allowChat && (
                    <td>
                      <button
                        className="action-btn secondary"
                        onClick={() => setActiveChat(item)}
                      >
                        Chat
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {allowChat && activeChat && (
        <ProductUserChatModal
          productUserId={activeChat._id}
          currentRole={currentRole}
          recipientEmail={activeChat.email}
          recipientLabel={activeChat.name || activeChat.email}
          title="Product User Chat"
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
