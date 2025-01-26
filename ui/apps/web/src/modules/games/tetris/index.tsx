import { createLazyRoute } from "@tanstack/react-router";

function Tetris() {
  return <div>Tetris</div>;
}

export const TetrisRoute = createLazyRoute("/")({
  component: Tetris,
});
