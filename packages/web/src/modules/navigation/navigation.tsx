import { Wingmnn } from "@icons/wingmnn";
import {
  cx,
  IconButton,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@wingmnn/components";
import { Link } from "@wingmnn/router";
import { map, reduceObj } from "@wingmnn/utils";
import { playMouseClickSound } from "@wingmnn/utils/interactivity";
import { motion } from "motion/react";
import React from "react";
import { type ModuleConfig, ModulesConfig } from "./config";
import { Modules } from "./constants";
import { BaseRoutes } from "./routes";

export function Navigation(props: { activeModule: Modules }) {
  const { activeModule } = props;

  const { topModules, bottomModules } = React.useMemo(() => {
    return reduceObj(
      ModulesConfig,
      (accm, module) => {
        const { placement = "top" } = module;
        if (placement === "top") {
          accm.topModules.push(module);
        } else {
          accm.bottomModules.push(module);
        }
        return accm;
      },
      {
        topModules: [] as Array<ModuleConfig>,
        bottomModules: [] as Array<ModuleConfig>,
      },
    );
  }, []);

  return (
    <motion.div
      initial={{ translateX: -50 }}
      animate={{ translateX: 0 }}
      exit={{ translateX: -50 }}
      className="h-full rounded-lg p-3 flex flex-col"
    >
      <div className="mx-auto flex items-center justify-center py-2">
        <Link
          to={BaseRoutes[Modules.HOME]}
          onClick={playMouseClickSound}
          className="focus-within:outline-2 focus-within:outline-offset-6 focus-within:outline-white-500 transition-all duration-100 focus-within:rounded-lg"
        >
          <Wingmnn
            width={24}
            height={24}
            className="animate-slow-spin text-accent"
          />
        </Link>
      </div>
      <Separator className="bg-transparent h-[1px] my-2 mb-3 mx-2 rounded-lg" />
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2">
          {map(topModules, (module) => (
            <Module
              key={module.id}
              module={module}
              isActive={module.id === activeModule}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {map(bottomModules, (module) => (
            <Module
              key={module.id}
              module={module}
              isActive={module.id === activeModule}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Module(props: { module: ModuleConfig; isActive: boolean }) {
  const { module, isActive } = props;
  const { id, icon, name, route, accent, accentText, disabled } = module;

  if (disabled) return null;

  return (
    <Link
      key={id}
      to={route}
      tabIndex={-1}
      onClick={playMouseClickSound}
      style={
        {
          "--accent": accent,
          "--accent-text": accentText,
        } as TSAny
      }
    >
      <Tooltip placement="right">
        <TooltipTrigger>
          <IconButton
            icon={icon}
            iconProps={{
              size: 20,
              className: cx(
                "text-accent group-hover/nav-item:text-[var(--accent-text)] transition-color duration-200",
                { "text-[var(--accent-text)]": isActive },
              ),
            }}
            className={cx(
              "group/nav-item p-2 bg-transparent focus-within:outline-accent hover:bg-accent",
              {
                "bg-accent": isActive,
              },
            )}
          />
        </TooltipTrigger>
        <TooltipContent inline className="bg-accent text-[var(--accent-text)]">
          {name}
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}
