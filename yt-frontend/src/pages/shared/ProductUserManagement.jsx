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
  loadSubscriptions,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [subsLoading, setSubsLoading] = useState(Boolean(loadSubscriptions));
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

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

  const loadSubs = async () => {
    if (!loadSubscriptions) return;
    try {
      setSubsLoading(true);
      const data = await loadSubscriptions();
      setProducts(data.products);
      setSubscriptions(data.subscriptions);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load product subscriptions");
      setProducts([]);
      setSubscriptions([]);
    } finally {
      setSubsLoading(false);
    }
  };

  // Subscriptions mode replaces the user list entirely, so only one of the two loads runs.
  useEffect(() => {
    if (loadSubscriptions) loadSubs();
    else load();
  }, []);

  const subsByProduct = (productName) =>
    subscriptions.filter((sub) => sub.productName === productName);
  const selectedSubs = selectedProduct ? subsByProduct(selectedProduct) : [];

  return (
    <div className="product-user-page">
      <div className="product-user-page-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="product-user-count">
          {loadSubscriptions ? `Products: ${products.length}` : `Total: ${items.length}`}
        </div>
      </div>

      {!loadSubscriptions && (
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
      )}

      {loadSubscriptions && (
        <>
          {subsLoading ? (
            <div className="product-user-table-wrap">
              <div className="empty-table-cell product-subscription-empty">
                Loading subscriptions...
              </div>
            </div>
          ) : (
            <div className="product-card-grid">
              {products.map((productName) => {
                const subs = subsByProduct(productName);
                const activeCount = subs.filter((sub) => sub.status === "verified").length;
                const isSelected = selectedProduct === productName;
                return (
                  <button
                    type="button"
                    key={productName}
                    className={`product-card${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedProduct(isSelected ? null : productName)}
                  >
                    <span className="product-card-name">{productName}</span>
                    <span className="product-card-stats">
                      {subs.length} subscription{subs.length === 1 ? "" : "s"} · {activeCount} active
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedProduct && !subsLoading && (
            <div className="product-user-table-wrap product-subscription-detail">
              <table className="product-user-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Mobile</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No subscriptions for {selectedProduct} yet.
                      </td>
                    </tr>
                  ) : (
                    selectedSubs.map((sub) => (
                      <tr key={sub._id}>
                        <td>
                          <div>{sub.customerName || "-"}</div>
                          <div className="product-subscription-email">{sub.email}</div>
                        </td>
                        <td>{sub.subscriberType}</td>
                        <td>{sub.mobile || "-"}</td>
                        <td>{sub.planCode}</td>
                        <td>
                          <span
                            className={`payment-status-badge ${
                              { verified: "paid", created: "pending" }[sub.status] || "failed"
                            }`}
                            title={sub.failureReason || undefined}
                          >
                            {{ verified: "Active", created: "Pending" }[sub.status] || "Failed"}
                          </span>
                        </td>
                        <td>{new Date(sub.createdAt).toLocaleDateString("en-IN")}</td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => setSelectedSubscription(sub)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedSubscription && (
        <div
          className="product-subscription-modal-backdrop"
          onClick={() => setSelectedSubscription(null)}
        >
          <div
            className="product-subscription-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="product-subscription-modal-head">
              <div>
                <p className="product-subscription-modal-label">Subscription Details</p>
                <h3>{selectedSubscription.customerName || selectedSubscription.email}</h3>
              </div>
              <button
                type="button"
                className="product-subscription-modal-close"
                onClick={() => setSelectedSubscription(null)}
              >
                &times;
              </button>
            </div>

            <div className="product-subscription-modal-grid">
              <div className="product-subscription-modal-field">
                <span>Email</span>
                <strong>{selectedSubscription.email}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Mobile</span>
                <strong>{selectedSubscription.mobile || "-"}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Product</span>
                <strong>{selectedSubscription.productName}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Type</span>
                <strong>{selectedSubscription.subscriberType}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Plan</span>
                <strong>{selectedSubscription.planCode}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Billing Cycle</span>
                <strong className="product-subscription-cycle">
                  {selectedSubscription.billingCycle || "-"}
                </strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Amount</span>
                <strong>₹{selectedSubscription.amount.toLocaleString("en-IN")}</strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Status</span>
                <strong>
                  <span
                    className={`payment-status-badge ${
                      { verified: "paid", created: "pending" }[selectedSubscription.status] || "failed"
                    }`}
                  >
                    {{ verified: "Active", created: "Pending" }[selectedSubscription.status] || "Failed"}
                  </span>
                </strong>
              </div>
              <div className="product-subscription-modal-field">
                <span>Date</span>
                <strong>{new Date(selectedSubscription.createdAt).toLocaleString("en-IN")}</strong>
              </div>
              <div className="product-subscription-modal-field product-subscription-modal-field-wide">
                <span>Payment ID</span>
                <strong>{selectedSubscription.razorpayPaymentId || "-"}</strong>
              </div>
              {selectedSubscription.failureReason && (
                <div className="product-subscription-modal-field product-subscription-modal-field-wide">
                  <span>Failure Reason</span>
                  <strong>{selectedSubscription.failureReason}</strong>
                </div>
              )}
            </div>

            {selectedSubscription.productUserId && (
              <button
                type="button"
                className="action-btn"
                onClick={() => navigate(`${basePath}/${selectedSubscription.productUserId}`)}
              >
                Open Product User Profile
              </button>
            )}
          </div>
        </div>
      )}

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
