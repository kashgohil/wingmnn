import {
  Calendar,
  CircleUserRound,
  Files,
  FileUser,
  Gamepad2,
  Heart,
  type LucideProps,
  Mailbox,
  MessageCircle,
  Music,
  Newspaper,
  Notebook,
  Settings,
  Sheet,
  SquareKanban,
  Wallet,
} from "lucide-react";
import { Modules } from "./constants";
import { BaseRoutes } from "./routes";

export type ModuleConfig = BaseDetails & {
  icon: React.ComponentType<LucideProps>;
  placement?: "top" | "bottom";
  disabled?: boolean;
  route: string;
  accent: string;
  accentText: string;
};

export const ExcludedModules = [Modules.HOME, Modules.ONBOARDING] as const;
export type ModulesConfigKey = Exclude<
  Modules,
  (typeof ExcludedModules)[number]
>;

export const ModulesConfig: Record<ModulesConfigKey, ModuleConfig> = {
  [Modules.MAILS]: {
    id: Modules.MAILS,
    name: "Mails",
    description: "Mails",
    icon: Mailbox,
    route: BaseRoutes[Modules.MAILS],
    accent: "var(--color-wisteria-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.MESSAGES]: {
    id: Modules.MESSAGES,
    name: "Messages",
    description: "Messages",
    icon: MessageCircle,
    route: BaseRoutes[Modules.MESSAGES],
    accent: "var(--color-cherry-blossom-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.CALENDAR]: {
    id: Modules.CALENDAR,
    name: "Calendar",
    description: "Calendar",
    icon: Calendar,
    route: BaseRoutes[Modules.CALENDAR],
    accent: "var(--color-mint-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.FEEDS]: {
    id: Modules.FEEDS,
    name: "Feeds",
    description: "Feeds",
    icon: Newspaper,
    route: BaseRoutes[Modules.FEEDS],
    accent: "var(--color-coral-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.FINANCE]: {
    id: Modules.FINANCE,
    name: "Finance",
    description: "Finance",
    icon: Wallet,
    route: BaseRoutes[Modules.FINANCE],
    accent: "var(--color-azure-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.PROJECTS]: {
    id: Modules.PROJECTS,
    name: "Projects",
    description: "Projects",
    icon: SquareKanban,
    route: BaseRoutes[Modules.PROJECTS],
    accent: "var(--color-amber-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.NOTES]: {
    id: Modules.NOTES,
    name: "Notes",
    description: "Notes",
    icon: Notebook,
    route: BaseRoutes[Modules.NOTES],
    accent: "var(--color-lime-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.FILES]: {
    id: Modules.FILES,
    name: "Files",
    description: "Files",
    icon: Files,
    route: BaseRoutes[Modules.FILES],
    accent: "var(--color-indigo-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.GAMES]: {
    id: Modules.GAMES,
    name: "Games",
    description: "Games",
    icon: Gamepad2,
    route: BaseRoutes[Modules.GAMES],
    accent: "var(--color-gold-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.MUSIC]: {
    id: Modules.MUSIC,
    name: "Music",
    description: "Music",
    icon: Music,
    route: BaseRoutes[Modules.MUSIC],
    accent: "var(--color-sage-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.SETTINGS]: {
    id: Modules.SETTINGS,
    name: "Settings",
    description: "Settings",
    icon: Settings,
    placement: "bottom",
    route: BaseRoutes[Modules.SETTINGS],
    accent: "var(--color-sunset-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.PROFILE]: {
    id: Modules.PROFILE,
    name: "Profile",
    description: "Profile",
    icon: CircleUserRound,
    placement: "bottom",
    route: BaseRoutes[Modules.PROFILE],
    accent: "var(--color-plum-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.RESUMES]: {
    id: Modules.RESUMES,
    name: "Resumes",
    description: "Resumes",
    icon: FileUser,
    route: BaseRoutes[Modules.RESUMES],
    accent: "var(--color-ocean-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.WELLNESS]: {
    id: Modules.WELLNESS,
    name: "Wellness",
    description: "Wellness",
    icon: Heart,
    route: BaseRoutes[Modules.WELLNESS],
    accent: "var(--color-rose-500)",
    accentText: "var(--color-black-500)",
  },
  [Modules.SHEETS]: {
    id: Modules.SHEETS,
    name: "Sheets",
    description: "Sheets",
    icon: Sheet,
    disabled: true,
    route: BaseRoutes[Modules.SHEETS],
    accent: "var(--color-emerald-500)",
    accentText: "var(--color-black-500)",
  },
};
