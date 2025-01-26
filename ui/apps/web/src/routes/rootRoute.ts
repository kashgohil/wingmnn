import { createRootRoute } from "@tanstack/react-router";
import { AuthWrapper } from "./authWrapper";
import { NotFoundComponent } from "./notFoundComponent";

export const rootRoute = createRootRoute({
  component: AuthWrapper,
  notFoundComponent: NotFoundComponent,
});
