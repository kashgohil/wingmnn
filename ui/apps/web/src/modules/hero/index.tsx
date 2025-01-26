import { createLazyRoute } from "@tanstack/react-router";

export default function Hero() {
  return (
    <div className="flex ">
      <div className="w-1/2"></div>
      <div className="w-1/2"></div>
    </div>
  );
}

export const HeroIndexRoute = createLazyRoute("/")({
  component: Hero,
  pendingComponent: () => <div>Loading...</div>,
});
