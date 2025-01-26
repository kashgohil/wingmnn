import { rootRoute } from "@routes/rootRoute";
import { createRoute } from "@tanstack/react-router";

const HomeRoute = createRoute({
  path: "/",
  getParentRoute: () => rootRoute,
}).lazy(() => import("./index").then((d) => d.HomeIndexRoute));

export { HomeRoute };
