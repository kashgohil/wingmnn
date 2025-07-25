import { get } from "@wingmnn/utils";
import React from "react";
import { useRouterContext } from "./context";
import { useLocationChangeDetection } from "./hooks/useLocationChangeDetection";
import { RouterUtils } from "./utils";

// add custom event for pushState and replaceState
const routerFlag = "router_changes_applied";

if (window?.history && get(window, routerFlag, "undefined") === "undefined") {
  Object.defineProperty(window, routerFlag, { value: "true" });

  const ogPushState = window.history.pushState;
  const ogReplaceState = window.history.replaceState;

  window.history.pushState = (data, unused, url) => {
    ogPushState.call(window.history, data, unused, url);
    const pushEvent = new CustomEvent("pushState", {
      detail: { data, unused, url },
    });
    dispatchEvent(pushEvent);
  };

  window.history.replaceState = (data, unused, url) => {
    ogReplaceState.call(window.history, data, unused, url);
    const replaceEvent = new CustomEvent("replaceState", {
      detail: { data, unused, url },
    });
    dispatchEvent(replaceEvent);
  };
}

export function useRouter() {
  const location = useLocationChangeDetection();
  const processedRoutes = useRouterContext("config");

  const route = React.useMemo(() => {
    return RouterUtils.getRoute(processedRoutes, location);
  }, [processedRoutes, location]);

  return { Component: route ? route.Component : null, id: route?.id, location };
}
