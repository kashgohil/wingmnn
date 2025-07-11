import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { Games } from "./games";
import { Home } from "./views/home";
import { Sudoku } from "./views/sudoku";

export const GamesRoute = {
  id: Modules.GAMES,
  path: BaseRoutes[Modules.GAMES],
  Component: Games,
  childRoutes: [
    {
      id: "GAMES_HOME",
      path: "/",
      Component: Home,
    },
    {
      id: "GAMES_SUDOKU",
      path: "/sudoku",
      Component: Sudoku,
    },
  ],
};
