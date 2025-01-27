import { Modules } from "./constants";

export const ModulesConfig: Record<Modules, BaseDetails> = {
  [Modules.CALENDAR]: {
    id: Modules.CALENDAR,
    label: "CALENDAR",
    description: "CALENDAR",
  },
  [Modules.FEEDS]: { id: Modules.FEEDS, label: "FEEDS", description: "FEEDS" },
  [Modules.FILES]: { id: Modules.FILES, label: "FILES", description: "FILES" },
  [Modules.FINANCE]: {
    id: Modules.FINANCE,
    label: "FINANCE",
    description: "FINANCE",
  },
  [Modules.GAMES]: { id: Modules.GAMES, label: "GAMES", description: "GAMES" },
  [Modules.MAILS]: { id: Modules.MAILS, label: "MAILS", description: "MAILS" },
  [Modules.MESSAGES]: {
    id: Modules.MESSAGES,
    label: "MESSAGES",
    description: "MESSAGES",
  },
  [Modules.MUSIC]: { id: Modules.MUSIC, label: "MUSIC", description: "MUSIC" },
  [Modules.NOTES]: { id: Modules.NOTES, label: "NOTES", description: "NOTES" },
  [Modules.PROJECTS]: {
    id: Modules.PROJECTS,
    label: "PROJECTS",
    description: "PROJECTS",
  },
  [Modules.PROFILE]: {
    id: Modules.PROFILE,
    label: "PROFILE",
    description: "PROFILE",
  },
  [Modules.RESUMES]: {
    id: Modules.RESUMES,
    label: "RESUMES",
    description: "RESUMES",
  },
  [Modules.WELLNESS]: {
    id: Modules.WELLNESS,
    label: "WELLNESS",
    description: "WELLNESS",
  },
  [Modules.SHEETS]: {
    id: Modules.SHEETS,
    label: "SHEETS",
    description: "SHEETS",
  },
  [Modules.SETTINGS]: {
    id: Modules.SETTINGS,
    label: "SETTINGS",
    description: "SETTINGS",
  },
};
