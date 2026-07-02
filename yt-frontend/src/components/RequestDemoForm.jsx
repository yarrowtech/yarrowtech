import React, { useEffect, useState } from "react";
import "./ModalForm.css";
import { X, Mail, PhoneCall, ClipboardList, Rocket } from "lucide-react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    icon: Mail,
    title: "Quick acknowledgement",
    desc: "You'll receive a confirmation email shortly.",
  },
  {
    icon: PhoneCall,
    title: "Introductory discussion",
    desc: "We schedule a call to understand your requirements.",
  },
  {
    icon: ClipboardList,
    title: "Solution planning",
    desc: "We prepare a proposal with timeline and cost.",
  },
  {
    icon: Rocket,
    title: "Project initiation",
    desc: "Development begins after approval.",
  },
];

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function RequestDemoForm({ onClose, showToast, currentUser }) {
  const isModal = !!onClose;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const toastFn =
    typeof showToast === "function" ? showToast : (t, m) => console.log(t, m);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: currentUser?.name || prev.name,
      email: currentUser?.email || prev.email,
    }));
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name.trim()) return toastFn("error", "Name is required");
    if (!formData.email.trim()) return toastFn("error", "Email is required");
    if (!isValidEmail(formData.email)) return toastFn("error", "Enter a valid email");
    if (!formData.message.trim()) return toastFn("error", "Message is required");

    try {
      setLoading(true);

      await API.post("/forms/demo", {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        companyName: formData.company.trim(),
        projectDescription: formData.message.trim(),
        serviceInterested: "Web Development",
      });

      toastFn("success", "Demo request submitted!");

      setTimeout(() => {
        setFormData({ name: "", email: "", company: "", message: "" });
        setLoading(false);
        if (isModal) onClose();
        else navigate("/");
      }, 1200);
    } catch (err) {
      if (err.response) {
        toastFn("error", err.response.data.message);
      } else if (err.request) {
        toastFn("error", "Server not responding");
      } else {
        toastFn("error", "Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={isModal ? "modal-overlay" : "page-wrapper"}
        onClick={() => isModal && onClose()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-box-demo two-column-demo"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35 }}
        >
          <div className="demo-form-side">
            {isModal && (
              <button className="close-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            )}

            <h2 className="modal-title">Request a demo</h2>
            <p className="modal-subtitle">Tell us about yourself and your company.</p>

            <form className="demo-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <input
                type="text"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
              />

              <textarea
                name="message"
                rows="3"
                maxLength={500}
                placeholder="Your message"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <div className="form-action-buttons">
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit request"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => (isModal ? onClose() : navigate("/"))}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="demo-info-side">
            <h3 className="info-title">How we turn your idea into a product</h3>
            <p className="info-sub">A clear look at our process from idea to launch.</p>

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div className="info-step" key={i}>
                  <div className="info-icon">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}