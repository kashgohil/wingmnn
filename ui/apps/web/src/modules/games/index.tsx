import { createLazyRoute } from "@tanstack/react-router";

function Games() {
  return <div>Games</div>;
}

export const GamesIndexRoute = createLazyRoute("/")({
  component: Games,
  pendingComponent: () => <div>Loading...</div>,
});
