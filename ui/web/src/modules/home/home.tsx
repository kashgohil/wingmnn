import { createLazyRoute } from "@tanstack/react-router";

function Home() {
  return <div>Landing page</div>;
}

export const Route = createLazyRoute("/")({
  component: Home,
});
