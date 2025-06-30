import {
  ExcludedModules,
  ModulesConfig,
  type ModulesConfigKey,
} from "@navigation/config";
import React from "react";

export function useAccentSetup(module?: string) {
  React.useEffect(() => {
    let {
      accent = "var(--color-white-100)",
      accentText = "var(--color-black-500)",
    } = ModulesConfig[module as ModulesConfigKey] || {};

    if (ExcludedModules.includes(module as TSAny)) {
      accent = "var(--color-white-100)";
      accentText = "var(--color-black-500)";
    }

    document.body.style.setProperty("--accent", accent);
    document.body.style.setProperty("--accent-text", accentText);
  }, [module]);
}
