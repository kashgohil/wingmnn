import { rootRoute } from "@routes/rootRoute";
import { createRoute } from "@tanstack/react-router";

const GamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "games",
});

const GamesIndexRoute = createRoute({
  getParentRoute: () => GamesRoute,
  path: "/",
}).lazy(() => import("./index").then((d) => d.GamesIndexRoute));

const GameOfLifeRoute = createRoute({
  getParentRoute: () => GamesRoute,
  path: "/game-of-life",
}).lazy(() => import("./game-of-life/index").then((d) => d.GameOfLifeRoute));

const SnakeRoute = createRoute({
  getParentRoute: () => GamesRoute,
  path: "/snake",
}).lazy(() => import("./snake/index").then((d) => d.SnakeRoute));

const TetrisRoute = createRoute({
  getParentRoute: () => GamesRoute,
  path: "/tetris",
}).lazy(() => import("./tetris/index").then((d) => d.TetrisRoute));

GamesRoute.addChildren([
  GamesIndexRoute,
  GameOfLifeRoute,
  SnakeRoute,
  TetrisRoute,
]);

export { GamesRoute };
