import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import ProductUserChatModal from "../../components/ProductUserChatModal";
import { productUserService } from "../../services/productUserService";
import "../../styles/ProductUserPortal.css";

export default function ProductUserChat() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await productUserService.project();
        setDetails(res?.productUser || null);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load chat details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p className="muted">Loading chat...</p>;
  if (!details?._id) return <p className="muted">Manager chat is not available.</p>;

  return (
    <div className="product-portal-page">
      <div className="product-portal-head">
        <h2>Manager Chat</h2>
        <p>Use this chat to communicate directly with your assigned manager.</p>
      </div>

      <ProductUserChatModal
        productUserId={details._id}
        currentRole="productuser"
        recipientEmail={details.manager?.email || details.managerEmail || ""}
        recipientLabel={details.manager?.name || details.managerEmail || "Manager"}
        title="Chat With Manager"
        onClose={() => navigate("/product-user/dashboard")}
      />
    </div>
  );
}
