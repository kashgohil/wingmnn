import { GamesRoute } from "@games/route";
import { rootRoute } from "./rootRoute";
import { HomeRoute } from "@home/route";

export const routeTree = rootRoute.addChildren([HomeRoute, GamesRoute]);
