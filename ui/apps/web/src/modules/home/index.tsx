import { createLazyRoute } from "@tanstack/react-router";

function Home() {
  return <div>It's good to be at home</div>;
}

export const HomeIndexRoute = createLazyRoute("/")({
  component: Home,
  pendingComponent: () => <div>Loading...</div>,
});
