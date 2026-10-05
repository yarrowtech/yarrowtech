import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App, { prepareInitialPage } from "./App.jsx";
import "./styles/responsive.css";

async function mount() {
  // Let the entry module finish before loading chunks that share its components.
  await prepareInitialPage(window.location.pathname);
  // React owns live metadata; preserve snapshot metadata until the route is ready.
  document.querySelectorAll('[data-prerender-head]').forEach(node => node.remove());
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <HelmetProvider><App /></HelmetProvider>
    </StrictMode>
  );
}
mount().catch(error => {
  console.error('Unable to load page', error);
  // Keep static content usable on a failed chunk request.
});
