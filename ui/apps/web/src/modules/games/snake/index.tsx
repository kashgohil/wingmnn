import { createLazyRoute } from "@tanstack/react-router";

function Snake() {}

export const SnakeRoute = createLazyRoute("/")({
  component: Snake,
  pendingComponent: () => <div>Loading...</div>,
});
