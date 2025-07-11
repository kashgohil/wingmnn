import { Views } from "@constants";
import { Tabs, Typography } from "@wingmnn/components";
import {
  BarChart,
  Calendar,
  Grid,
  PieChart,
  Table,
} from "@wingmnn/components/icons";
import React from "react";

export function Home() {
  return (
    <div className="flex flex-col p-4">
      <Header />
      <div></div>
    </div>
  );
}

const VIEWS = [
  { id: Views.GRID, name: "", description: "Grid View", icon: Grid },
  { id: Views.LIST, name: "", description: "List View", icon: Table },
  {
    id: Views.CALENDAR,
    name: "",
    description: "Calendar View",
    icon: Calendar,
  },
  {
    id: Views.TIMELINE,
    name: "",
    description: "Timeline View",
    icon: BarChart,
  },
  { id: Views.CHART, name: "", description: "Chart View", icon: PieChart },
];

function Header() {
  const [view, setView] = React.useState<string>(Views.GRID);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="w-full flex flex-col">
        <Typography.H1 className="text-2xl font-spicy-rice tracking-wide text-accent">
          Games
        </Typography.H1>
        <Typography.Caption className="text-accent/80">
          Who does not want to play games?
        </Typography.Caption>
      </div>
      <div className="flex items-center">
        <Tabs tabs={VIEWS} activeTab={view} onChange={setView} />
      </div>
    </div>
  );
}
