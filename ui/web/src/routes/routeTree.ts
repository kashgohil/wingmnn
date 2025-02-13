import { rootRoute } from "./rootRoute";
import { HomeRoute } from "@home/route";
import { TestingRoute } from "@testing/route";

export const routeTree = rootRoute.addChildren([HomeRoute, TestingRoute]);
