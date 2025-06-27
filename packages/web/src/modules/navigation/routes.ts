import { Modules } from "./constants";

export const BaseRoutes: Record<Modules, string> = {
  [Modules.HOME]: "/",
  [Modules.CALENDAR]: "/calendar",
  [Modules.FEEDS]: "/feeds",
  [Modules.FILES]: "/files",
  [Modules.FINANCE]: "/finance",
  [Modules.PROJECTS]: "/projects",
  [Modules.GAMES]: "/games",
  [Modules.MAILS]: "/mails",
  [Modules.MUSIC]: "/music",
  [Modules.MESSAGES]: "/messages",
  [Modules.NOTES]: "/notes",
  [Modules.PROFILE]: "/profile",
  [Modules.RESUMES]: "/resumes",
  [Modules.WELLNESS]: "/wellness",
  [Modules.SETTINGS]: "/settings",
  [Modules.SHEETS]: "/sheets",
  [Modules.ONBOARDING]: "/onboarding",
};
