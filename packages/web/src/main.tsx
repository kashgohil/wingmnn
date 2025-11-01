import "./index.css";

import { Vitals } from "@components/vitals";
import { AuthRouter } from "@routes/authRouter";
import { ROUTES_CONFIG } from "@routes/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Cookie } from "@utility/browser";
import { ToastProvider } from "@wingmnn/components";
import { RouterProvider } from "@wingmnn/router";
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

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider config={ROUTES_CONFIG}>
          <AuthRouter />
        </RouterProvider>
        <Vitals />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
