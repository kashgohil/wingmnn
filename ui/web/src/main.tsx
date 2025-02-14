import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";

import { routeTree } from "@routes/routeTree";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const queryClient = new QueryClient();

const router = createRouter({ routeTree, context: { queryClient } });

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  scan({
    enabled: true,
    log: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
