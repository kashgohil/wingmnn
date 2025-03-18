import { IconButton } from "@components/iconButton/iconButton";
import { Separator } from "@components/separator/separator";
import { Tooltip } from "@components/tooltip/tooltip";
import { useLocationChangeDetection } from "@frameworks/router/hooks/useLocationChangeDetection";
import { Link } from "@frameworks/router/Link";
import { Wingmnn } from "@icons/wingmnn";
import { cx } from "@utility/cx";
import { forEachObj } from "@utility/forEach";
import { includes } from "@utility/includes";
import { map } from "@utility/map";
import { reduceObj } from "@utility/reduce";
import React from "react";
import { ModuleConfig, ModulesConfig } from "./config";
import { Modules } from "./constants";
import { BaseRoutes } from "./routes";

export function Navigation() {
  const location = useLocationChangeDetection();

  const activeModule = React.useMemo(() => {
    let activeModule = Modules.HOME;
    forEachObj(BaseRoutes, (route, key) => {
      if (key !== Modules.HOME && includes(location, route)) {
        activeModule = key;
        return false;
      }
    });
    return activeModule;
  }, [location]);

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
    <div className="h-full rounded-lg p-2 bg-black-100 flex flex-col">
      <div className="mx-auto flex items-center justify-center py-2">
        <Link
          to={BaseRoutes[Modules.HOME]}
          className="focus-within:outline-2 focus-within:outline-offset-6 focus-within:outline-white-500 transition-all duration-100 focus-within:rounded-lg"
        >
          <Wingmnn
            width={24}
            height={24}
            className="animate-slow-spin text-white-500"
          />
        </Link>
      </div>
      <Separator className="bg-white-950 h-[1px] my-2 mx-2 rounded-lg" />
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col space-y-1">
          {map(topModules, (module) => {
            const { id, icon, name, route } = module;
            return (
              <Link to={route} key={id} tabIndex={-1}>
                <Tooltip title={name}>
                  <IconButton
                    icon={icon}
                    iconProps={{ size: 20 }}
                    className={cx(
                      "p-2 bg-transparent focus-within:outline-white-500 text-white-500 hover:bg-white-500 hover:text-black-200",
                      { "text-black-200 bg-white-500": activeModule === id },
                    )}
                  />
                </Tooltip>
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col space-y-1">
          {map(bottomModules, (module) => {
            const { id, icon, name, route } = module;
            return (
              <Link to={route} key={id} tabIndex={-1}>
                <Tooltip title={name}>
                  <IconButton
                    icon={icon}
                    iconProps={{ size: 20 }}
                    className={cx(
                      "p-2 bg-transparent focus-within:outline-white-500 text-white-500 hover:bg-white-500 hover:text-black-200",
                      { "text-black-200 bg-white-500": activeModule === id },
                    )}
                  />
                </Tooltip>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
