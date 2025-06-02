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
  route: string;
};

export const ModulesConfig: Record<
  Exclude<Modules, Modules.HOME>,
  ModuleConfig
> = {
  [Modules.MAILS]: {
    id: Modules.MAILS,
    name: "Mails",
    description: "Mails",
    icon: Mailbox,
    route: BaseRoutes[Modules.MAILS],
  },
  [Modules.MESSAGES]: {
    id: Modules.MESSAGES,
    name: "Messages",
    description: "Messages",
    icon: MessageCircle,
    route: BaseRoutes[Modules.MESSAGES],
  },
  [Modules.CALENDAR]: {
    id: Modules.CALENDAR,
    name: "Calendar",
    description: "Calendar",
    icon: Calendar,
    route: BaseRoutes[Modules.CALENDAR],
  },
  [Modules.FEEDS]: {
    id: Modules.FEEDS,
    name: "Feeds",
    description: "Feeds",
    icon: Newspaper,
    route: BaseRoutes[Modules.FEEDS],
  },
  [Modules.FINANCE]: {
    id: Modules.FINANCE,
    name: "Finance",
    description: "Finance",
    icon: Wallet,
    route: BaseRoutes[Modules.FINANCE],
  },
  [Modules.PROJECTS]: {
    id: Modules.PROJECTS,
    name: "Projects",
    description: "Projects",
    icon: SquareKanban,
    route: BaseRoutes[Modules.PROJECTS],
  },
  [Modules.NOTES]: {
    id: Modules.NOTES,
    name: "Notes",
    description: "Notes",
    icon: Notebook,
    route: BaseRoutes[Modules.NOTES],
  },
  [Modules.FILES]: {
    id: Modules.FILES,
    name: "Files",
    description: "Files",
    icon: Files,
    route: BaseRoutes[Modules.FILES],
  },
  [Modules.GAMES]: {
    id: Modules.GAMES,
    name: "Games",
    description: "Games",
    icon: Gamepad2,
    route: BaseRoutes[Modules.GAMES],
  },
  [Modules.MUSIC]: {
    id: Modules.MUSIC,
    name: "Music",
    description: "Music",
    icon: Music,
    route: BaseRoutes[Modules.MUSIC],
  },
  [Modules.SETTINGS]: {
    id: Modules.SETTINGS,
    name: "Settings",
    description: "Settings",
    icon: Settings,
    placement: "bottom",
    route: BaseRoutes[Modules.SETTINGS],
  },
  [Modules.PROFILE]: {
    id: Modules.PROFILE,
    name: "Profile",
    description: "Profile",
    icon: CircleUserRound,
    placement: "bottom",
    route: BaseRoutes[Modules.PROFILE],
  },
  [Modules.RESUMES]: {
    id: Modules.RESUMES,
    name: "Resumes",
    description: "Resumes",
    icon: FileUser,
    route: BaseRoutes[Modules.RESUMES],
  },
  [Modules.WELLNESS]: {
    id: Modules.WELLNESS,
    name: "Wellness",
    description: "Wellness",
    icon: Heart,
    route: BaseRoutes[Modules.WELLNESS],
  },
  [Modules.SHEETS]: {
    id: Modules.SHEETS,
    name: "Sheets",
    description: "Sheets",
    icon: Sheet,
    route: BaseRoutes[Modules.SHEETS],
  },
};
