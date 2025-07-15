import { Views } from "@constants";
import {
  AlignLeft,
  Calendar,
  Grid,
  List,
  PieChart,
  type LucideProps,
} from "@wingmnn/components/icons";

interface ViewConfig {
  id: Views;
  name: string;
  description: string;
  icon: React.FC<LucideProps>;
}

export const VIEWS_CONFIG: Record<Views, ViewConfig> = {
  [Views.GRID]: {
    id: Views.GRID,
    name: "",
    description: "Grid View",
    icon: Grid,
  },
  [Views.LIST]: {
    id: Views.LIST,
    name: "",
    description: "List View",
    icon: List,
  },
  [Views.CHART]: {
    id: Views.CHART,
    name: "",
    description: "Chart View",
    icon: PieChart,
  },
  [Views.TIMELINE]: {
    id: Views.TIMELINE,
    name: "",
    description: "Timeline View",
    icon: AlignLeft,
  },
  [Views.CALENDAR]: {
    id: Views.CALENDAR,
    name: "",
    description: "Calendar View",
    icon: Calendar,
  },
};
