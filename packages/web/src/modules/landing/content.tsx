import {
  ExcludedModules,
  ModulesConfig,
  type ModulesConfigKey,
} from "@navigation/config";
import { Typography } from "@wingmnn/components";
import { mapObj } from "@wingmnn/utils";
import React from "react";

export function Content() {
  const [module, setModule] = React.useState("");

  const { accent, accentText } = React.useMemo(() => {
    if (!module)
      return {
        accent: "var(--color-black-500)",
        accentText: "var(--color-white-500)",
      };
    if (ExcludedModules.includes(module as TSAny))
      return {
        accent: "var(--color-black-500)",
        accentText: "var(--color-white-500)",
      };
    const config = ModulesConfig[module as ModulesConfigKey];
    return { accent: config.accent, accentText: config.accentText };
  }, [module]);

  return (
    <div
      className="h-full items-center flex-1 flex gap-8"
      style={{ "--accent": accent, "--accent-text": accentText } as TSAny}
    >
      <div className="sticky left-0 flex flex-col items-start gap-2">
        {mapObj(ModulesConfig, (config, key) => {
          const { accentText, accent, icon: Icon, placement } = config;

          if (placement === "bottom") return null;

          return (
            <div
              key={key}
              tabIndex={0}
              onMouseOver={() => setModule(key)}
              style={
                { "--accent": accent, "--accent-text": accentText } as TSAny
              }
              className="group/list-item hover:bg-accent text-accent hover:text-[var(--accent-text)] outline-offset-4 outline-accent cursor-pointer flex items-center space-x-2 p-2 px-4 rounded-lg gap-2"
            >
              <Icon className="text-accent group-hover/list-item:text-[var(--accent-text)]" />
              <Typography.Paragraph>{config.description}</Typography.Paragraph>
            </div>
          );
        })}
      </div>
      <div className="bg-accent/20 rounded-4xl h-full flex-1"></div>
    </div>
  );
}
