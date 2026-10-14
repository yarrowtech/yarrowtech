import React from "react";
import { Menu } from "lucide-react";

/* Sticky top bar shown on phones/tablets only. Opens the sidebar drawer. */
export default function MobileTopBar({ title, open, onOpen }) {
  return (
    <header className="app-mobile-bar">
      <button
        type="button"
        className="app-menu-btn"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={onOpen}
      >
        <Menu size={22} />
      </button>
      <span className="app-mobile-title">{title}</span>
    </header>
  );
}
