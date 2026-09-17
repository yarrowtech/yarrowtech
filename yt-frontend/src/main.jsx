import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App.jsx";
import "./styles/responsive.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

const AppWithAuth = GOOGLE_CLIENT_ID ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>{AppWithAuth}</HelmetProvider>
  </StrictMode>
);
