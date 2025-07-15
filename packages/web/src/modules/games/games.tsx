import { VIEWS_CONFIG } from "@config";
import { BaseRoutes } from "@navigation/routes";
import { Button, cx, Tabs, Typography } from "@wingmnn/components";
import {
  ChartPie,
  ChevronLeft,
  Gamepad2,
  Glasses,
} from "@wingmnn/components/icons";
import { Link, usePathParams } from "@wingmnn/router";
import React from "react";
import { GAMES_CONFIG } from "./config";
import { Games as GamesEnum } from "./constants";
import { GamesActions, useGames } from "./store/useGames";

interface Props {
  children: React.ReactNode;
}

const VIEWS = [VIEWS_CONFIG.GRID, VIEWS_CONFIG.LIST, VIEWS_CONFIG.CHART];
const TABS = [
  { id: "history", description: "History", name: "", icon: Glasses },
  { id: "game", description: "Game", name: "", icon: Gamepad2 },
  { id: "analytics", description: "Analytics", name: "", icon: ChartPie },
];

export function Games(props: Props) {
  const { children } = props;

  return (
    <div className="flex flex-col h-full">
      <Header />
      {children}
    </div>
  );
}

function Header() {
  const view = useGames("view");
  const tab = useGames("tab");
  const { game } = usePathParams<{ game: GamesEnum }>();

  let name = "Games";
  let description = "Because why not?";

  if (GAMES_CONFIG[game]) {
    const config = GAMES_CONFIG[game];
    name = config.name;
    description = config.description;
  }

  return (
    <div className="flex items-center justify-between w-full p-4 relative">
      {game && (
        <Link to={BaseRoutes.GAMES}>
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center group/back p-2 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="text-accent" />
            <div className="w-0 max-w-[200px] whitespace-nowrap overflow-hidden group-hover/back:w-[75px] transition-all duration-200 text-left">
              <Typography.H4 className="font-spicy-rice text-accent">
                try new?
              </Typography.H4>
            </div>
          </Button>
        </Link>
      )}
      <div
        className={cx(
          "flex flex-col",
          game && "text-center absolute left-1/2 -translate-x-1/2",
        )}
      >
        <Typography.H1 className="font-spicy-rice tracking-wide text-accent">
          {name}
        </Typography.H1>
        <Typography.Caption className="text-accent/80">
          {description}
        </Typography.Caption>
      </div>
      {!game && (
        <div className="flex items-center">
          <Tabs tabs={VIEWS} activeTab={view} onChange={GamesActions.setView} />
        </div>
      )}
      {game && (
        <div className="flex items-center">
          <Tabs
            tabClassName="text-sm"
            tabs={TABS}
            activeTab={tab}
            onChange={GamesActions.setTab}
          />
        </div>
      )}
    </div>
  );
}
