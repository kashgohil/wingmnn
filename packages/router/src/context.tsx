import React from "react";
import type { RouterConfig } from "./type";
import { RouterUtils } from "./utils";

interface RouterContextProps {
  config: RouterConfig;
}

const RouterContext = React.createContext<RouterContextProps>({
  config: [],
});

export const RouterProvider = ({
  config,
  children,
}: {
  config: RouterConfig;
  children: React.ReactNode;
}) => {
  const processedRoutes = React.useMemo(() => {
    return RouterUtils.processRoutes(config);
  }, [config]);

  return (
    <RouterContext.Provider value={{ config: processedRoutes }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouterContext(key: keyof RouterContextProps) {
  const { [key]: value } = React.useContext(RouterContext);
  return value;
}
