import { RouterConfig } from "@frameworks/router/type";
import { HomeRoute } from "@home/route";
import { ProjectsRoute } from "@projects/route";
import { MailsRoute } from "src/modules/mails/route";

export const ROUTES_CONFIG: RouterConfig = [
  HomeRoute,
  MailsRoute,
  ProjectsRoute,
];
