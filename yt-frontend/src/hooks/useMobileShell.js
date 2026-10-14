import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/* Shared mobile behaviour for panel layouts (admin, tech lead):
   - drawer open/close state, closed after navigation and on Esc
   - page scroll locked while the drawer is open
   - table cells labelled with their column header so tables can reflow into cards */
export default function useMobileShell(contentSelector) {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setNavOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle("app-nav-open", navOpen);
    return () => document.body.classList.remove("app-nav-open");
  }, [navOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const root = document.querySelector(contentSelector);
    if (!root) return undefined;
    const label = () => {
      root.querySelectorAll("table").forEach((table) => {
        const heads = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
        if (!heads.length) return;
        table.classList.add("m-stack");
        table.querySelectorAll("tbody tr").forEach((tr) => {
          Array.from(tr.children).forEach((td, i) => {
            if (td.tagName === "TD" && !td.hasAttribute("data-label") && heads[i]) {
              td.setAttribute("data-label", heads[i]);
            }
          });
        });
      });
    };
    label();
    const observer = new MutationObserver(label);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [contentSelector]);

  return { navOpen, openNav: () => setNavOpen(true), closeNav: () => setNavOpen(false) };
}
