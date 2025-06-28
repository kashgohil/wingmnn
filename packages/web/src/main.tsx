import { QueryProvider } from "@frameworks/query/provider";
import "./index.css";

import { Vitals } from "@components/vitals";
import { QueryClient } from "@frameworks/query/context";
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

const queryClient = QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider value={queryClient}>
      <AuthRouter />
      <Vitals />
    </QueryProvider>
  </StrictMode>,
);
