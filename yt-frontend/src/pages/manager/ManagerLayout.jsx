import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import ManagerSidebar from "../../components/ManagerSidebar";
import "../../styles/ManagerLayout.css";
import "../../styles/ManagerMobile.css";

export default function ManagerLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Close the drawer after navigating, and lock page scroll while it is open.
  useEffect(() => setNavOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    document.body.classList.toggle("manager-nav-open", navOpen);
    return () => document.body.classList.remove("manager-nav-open");
  }, [navOpen]);
  // Label every table cell with its column header so tables can reflow into
  // stacked cards on phones (see ManagerMobile.css) instead of scrolling sideways.
  useEffect(() => {
    const root = document.querySelector(".manager-inner");
    if (!root) return undefined;
    const label = () => {
      root.querySelectorAll("table").forEach((table) => {
        const heads = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
        if (!heads.length) return;
        table.classList.add("m-stack");
        table.querySelectorAll("tbody tr").forEach((tr) => {
          Array.from(tr.children).forEach((td, i) => {
            if (td.tagName === "TD" && !td.hasAttribute("data-label") && heads[i]) td.setAttribute("data-label", heads[i]);
          });
        });
      });
    };
    label();
    const observer = new MutationObserver(label);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="manager-layout">
      <header className="manager-mobile-bar">
        <button
          type="button"
          className="manager-menu-btn"
          aria-label="Open menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(true)}
        >
          <Menu size={22} />
        </button>
        <span className="manager-mobile-title">Manager Panel</span>
      </header>

      <ManagerSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <div className="manager-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="manager-content">
        <div className="manager-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
