// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// import "./index.css";
// import "./styles/responsive.css";

// import App from "./App.jsx";

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     {GOOGLE_CLIENT_ID ? (
//       <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//         <App />
//       </GoogleOAuthProvider>
//     ) : (
//       <>
//         {console.error("❌ VITE_GOOGLE_CLIENT_ID is missing")}
//         <App />
//       </>
//     )}
//   </StrictMode>
// );







import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";
import "./styles/responsive.css";

const GOOGLE_CLIENT_ID =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID
    : null;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <>
        {console.error(
          "❌ VITE_GOOGLE_CLIENT_ID is missing or invalid. Google OAuth disabled."
        )}
        <App />
      </>
    )}
  </StrictMode>
);
