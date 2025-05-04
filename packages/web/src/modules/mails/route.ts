import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { Mails } from "./mails";
import { Home } from "./views/home";
import { MailId } from "./views/mailId";

export const MailsRoute = {
  id: Modules.MAILS,
  path: BaseRoutes[Modules.MAILS],
  Component: Mails,
  childRoutes: [
    {
      id: "MAILS_HOME",
      path: "/",
      Component: Home,
    },
    {
      id: "MAIL_ID",
      path: "/:id",
      Component: MailId,
    },
  ],
};
