import {
  Calendar,
  CircleUserRound,
  Files,
  FileUser,
  Gamepad2,
  Heart,
  LucideProps,
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

export type ModuleConfig = BaseDetails & {
  icon: React.ComponentType<LucideProps>;
  placement?: "top" | "bottom";
};

export const ModulesConfig: Record<Modules, ModuleConfig> = {
  [Modules.MAILS]: {
    id: Modules.MAILS,
    label: "Mails",
    description: "Mails",
    icon: Mailbox,
  },
  [Modules.MESSAGES]: {
    id: Modules.MESSAGES,
    label: "Messages",
    description: "Messages",
    icon: MessageCircle,
  },
  [Modules.CALENDAR]: {
    id: Modules.CALENDAR,
    label: "Calendar",
    description: "Calendar",
    icon: Calendar,
  },
  [Modules.FEEDS]: {
    id: Modules.FEEDS,
    label: "Feeds",
    description: "Feeds",
    icon: Newspaper,
  },
  [Modules.FINANCE]: {
    id: Modules.FINANCE,
    label: "Finance",
    description: "Finance",
    icon: Wallet,
  },
  [Modules.PROJECTS]: {
    id: Modules.PROJECTS,
    label: "Projects",
    description: "Projects",
    icon: SquareKanban,
  },
  [Modules.NOTES]: {
    id: Modules.NOTES,
    label: "Notes",
    description: "Notes",
    icon: Notebook,
  },
  [Modules.FILES]: {
    id: Modules.FILES,
    label: "Files",
    description: "Files",
    icon: Files,
  },
  [Modules.GAMES]: {
    id: Modules.GAMES,
    label: "Games",
    description: "Games",
    icon: Gamepad2,
  },
  [Modules.MUSIC]: {
    id: Modules.MUSIC,
    label: "Music",
    description: "Music",
    icon: Music,
  },
  [Modules.PROFILE]: {
    id: Modules.PROFILE,
    label: "Profile",
    description: "Profile",
    icon: CircleUserRound,
    placement: "bottom",
  },
  [Modules.RESUMES]: {
    id: Modules.RESUMES,
    label: "Resumes",
    description: "Resumes",
    icon: FileUser,
  },
  [Modules.WELLNESS]: {
    id: Modules.WELLNESS,
    label: "Wellness",
    description: "Wellness",
    icon: Heart,
  },
  [Modules.SHEETS]: {
    id: Modules.SHEETS,
    label: "Sheets",
    description: "Sheets",
    icon: Sheet,
  },
  [Modules.SETTINGS]: {
    id: Modules.SETTINGS,
    label: "Settings",
    description: "Settings",
    icon: Settings,
    placement: "bottom",
  },
};
