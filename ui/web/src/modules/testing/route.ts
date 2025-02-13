import { rootRoute } from "@routes/rootRoute";
import { createRoute } from "@tanstack/react-router";

export const TestingRoute = createRoute({
  path: "/testing",
  getParentRoute: () => rootRoute,
}).lazy(() => import("./testing").then((r) => r.TestingRoute));
