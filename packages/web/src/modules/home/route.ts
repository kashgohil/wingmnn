import { BaseRoutes } from "@navigation/routes";
import { Home } from "./home";
import { Modules } from "@navigation/constants";

export const HomeRoute = {
  id: "HOME",
  path: BaseRoutes[Modules.HOME],
  Component: Home,
};
