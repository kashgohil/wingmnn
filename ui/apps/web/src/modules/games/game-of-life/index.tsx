import { createLazyRoute } from "@tanstack/react-router";

function GameOfLife() {
  return <div>Game of Life</div>;
}

export const GameOfLifeRoute = createLazyRoute("/")({
  component: GameOfLife,
  pendingComponent: () => <div>Loading...</div>,
});
