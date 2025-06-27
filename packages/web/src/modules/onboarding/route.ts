import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { Onboarding } from "./onboarding";

export const OnboardingRoute = {
  id: Modules.ONBOARDING,
  path: BaseRoutes[Modules.ONBOARDING],
  Component: Onboarding,
};
