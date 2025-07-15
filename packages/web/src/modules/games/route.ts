import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { Games } from "./games";
import { Game } from "./views/game";
import { Home } from "./views/home/home";

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
      id: "GAME_PAGE",
      path: "/:game",
      Component: Game,
      childRoutes: [
        {
          id: "GAME_PAGE_DETAILS",
          path: "/:id",
          Component: Game,
        },
      ],
    },
  ],
};
