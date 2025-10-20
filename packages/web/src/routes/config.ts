import { FinanceRoute } from "@finance/route";
import { GamesRoute } from "@games/route";
import { HomeRoute } from "@home/route";
import { MailsRoute } from "@mails/route";
import { NotesRoute } from "@notes/route";
import { OnboardingRoute } from "@onboarding/route";
import { ProfileRoute } from "@profile/route";
import { ProjectsRoute } from "@projects/route";
import { type RouterConfig } from "@wingmnn/router";

export const ROUTES_CONFIG: RouterConfig = [
  HomeRoute,
  OnboardingRoute,
  MailsRoute,
  ProjectsRoute,
  NotesRoute,
  GamesRoute,
  FinanceRoute,
  ProfileRoute,
];
