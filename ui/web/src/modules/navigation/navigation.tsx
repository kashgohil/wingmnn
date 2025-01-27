import { ModulesConfig } from "./config";

export function Navigation() {
  return (
    <div className="flex flex-col p-2 bg-zinc-600 h-full space-y-2">
      {ModulesConfig.map((config) => (
        <div>{config.label}</div>
      ))}
    </div>
  );
}
