import { rootRoute } from "@routes/rootRoute";
import { createRoute } from "@tanstack/react-router";

export const HomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
}).lazy(() => import("./home").then((d) => d.Route));
