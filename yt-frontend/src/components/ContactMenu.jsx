import React, { useState } from "react";
import { Mail, Phone, X, MessageCircle } from "lucide-react";
import "./ContactMenu.css";   // ⭐ VERY IMPORTANT

export default function ContactMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="contact-widget">
      <div className={`contact-options ${open ? "open" : ""}`}>

        {/* WhatsApp */}
        <a
          href="https://wa.me/+919830590929"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-item"
        >
          <span className="label">WhatsApp</span>
          <div className="icon-circle">
            <MessageCircle size={20} color="#fff" />
          </div>
        </a>

        {/* Email */}
        <a href="mailto:career@yarrowtech.co.in" className="contact-item">
          <span className="label">Email</span>
          <div className="icon-circle">
            <Mail size={20} color="#fff" />
          </div>
        </a>

        {/* Call */}
        <a href="tel:+919830590929" className="contact-item">
          <span className="label">Call</span>
          <div className="icon-circle">
            <Phone size={20} color="#fff" />
          </div>
        </a>
      </div>

      {/* Main Toggle Button */}
      <div className="contact-toggle" onClick={() => setOpen(!open)}>
        {open ? <X size={26} color="#fff" /> : <MessageCircle size={26} color="#fff" />}
      </div>
    </div>
  );
}
