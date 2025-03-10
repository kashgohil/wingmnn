import "./index.css";

import { AuthRouter } from "@routes/authRouter";
import { Cookie } from "@utility/browser";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";

Cookie.setCSRFCookie();

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  scan({
    enabled: true,
    log: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthRouter />
  </StrictMode>,
);
