import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SectionRouteRedirect({ sectionId }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Detect hard refresh vs in-app navigation
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const isReload = nav?.type === "reload";

    // Always replace current route with Home
    navigate("/", { replace: true });

    if (!isReload) {
      // In-app navigation: scroll to the section and keep hash (for shareability)
      requestAnimationFrame(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", `/#${sectionId}`);
      });
    } else {
      // Hard refresh: stay at top and clear any hash
      if (history.replaceState) history.replaceState(null, "", "/#");
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [navigate, sectionId]);

  return null;
}
