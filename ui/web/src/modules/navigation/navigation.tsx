import { IconButton } from "@components/iconButton/iconButton";
import { Separator } from "@components/separator/separator";
import { Tooltip } from "@components/tooltip/tooltip";
import { Wingmnn } from "@icons/wingmnn";
import { map } from "@utility/map";
import { reduceObj } from "@utility/reduce";
import React from "react";
import { ModuleConfig, ModulesConfig } from "./config";

export function Navigation() {
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
        <Wingmnn
          height={24}
          width={24}
          className="animate-slow-spin text-white-500"
        />
      </div>
      <Separator className="bg-white-950 h-[1px] my-2 mx-2 rounded-lg" />
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col space-y-1">
          {map(topModules, (module) => {
            const { id, icon, label } = module;
            return (
              <Tooltip title={label}>
                <IconButton
                  key={id}
                  icon={icon}
                  iconProps={{ size: 20 }}
                  className="p-2 bg-transparent focus-within:outline-white-500 text-white-500 hover:bg-white-500 hover:text-black-200"
                />
              </Tooltip>
            );
          })}
        </div>
        <div className="flex flex-col space-y-1">
          {map(bottomModules, (module) => {
            const { id, icon, label } = module;
            return (
              <Tooltip title={label}>
                <IconButton
                  key={id}
                  icon={icon}
                  iconProps={{ size: 20 }}
                  className="p-2 bg-transparent focus-within:outline-white-500 text-white-500 hover:bg-white-500 hover:text-black-200"
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
