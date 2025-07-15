import React from "react";
import { useRouterContext } from "../context";
import { RouterUtils } from "../utils";
import { useLocationChangeDetection } from "./useLocationChangeDetection";

export function useQueryParams<T>() {
  const location = useLocationChangeDetection();
  return React.useMemo<T>(() => {
    return RouterUtils.getQueryParams<T>(location);
  }, [location]);
}

export function usePathParams<T>() {
  const location = useLocationChangeDetection();
  const config = useRouterContext("config");

  return React.useMemo<T>(() => {
    return RouterUtils.getPathParams<T>(config, location);
  }, [location, config]);
}
