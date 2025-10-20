import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { Finance } from "./finance";
import { AccountId } from "./views/accountId";
import { Home } from "./views/home";

export const FinanceRoute = {
  id: Modules.FINANCE,
  path: BaseRoutes[Modules.FINANCE],
  Component: Finance,
  childRoutes: [
    {
      id: "FINANCE_HOME",
      path: "/",
      Component: Home,
    },
    {
      id: "FINANCE_ACCOUNT",
      path: "/account/:accountId",
      Component: AccountId,
    },
  ],
};
