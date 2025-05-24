import { RouterConfig } from "@frameworks/router/type";
import { HomeRoute } from "@home/route";
import { ProjectsRoute } from "@projects/route";
import { MailsRoute } from "src/modules/mails/route";
import { OnboardingRoute } from "src/modules/onboarding/route";

export const ROUTES_CONFIG: RouterConfig = [
  OnboardingRoute,
  HomeRoute,
  MailsRoute,
  ProjectsRoute,
];
