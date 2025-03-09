import { forEachArray } from "@utility/forEach";
import { RouteConfig, RouterConfig } from "./type";
import { getWrapperComponent } from "./wrapperComponentFn";

function getRouterUtils () {
  // private
  function _flattenRoute(config: RouteConfig) {
    const routes = [];
    const stack: Array<{ route: RouteConfig, parent: RouteConfig | null }> = [{ route: config, parent: null }];

    while (stack.length > 0) {
      const { route, parent } = stack.pop() || {};

      if (!route) continue;

      const updatedRoute = {
        ...route,
        path: parent ? `${parent.path}/${route.path}` : route.path,
        Component: parent ? getWrapperComponent(parent.Component, route.Component): route.Component,
      };

      if (route.childRoutes?.length) {
        for (let index = route.childRoutes.length - 1; index >= 0; index--) {
          const childRoute = route.childRoutes[index];
          stack.push({ route: childRoute, parent: updatedRoute });
        }
      }

      routes.push(updatedRoute);
    }

    return routes;
  }

  // public
  function getPath() {
    return window.location.pathname;
  }

  function getHash() {
    return window.location.hash;
  }

  function matchRoute(route: RouteConfig, location: string) {
    const { path } = route;

    const locationChunks = location.split('/').filter(Boolean);
    const pathChunks = path.trim().split('/').filter(Boolean);

    if (locationChunks.length > pathChunks.length) return false;

    for (let i = 0; i < locationChunks.length; i++) {
      const locationChunk = locationChunks[i];
      const pathChunk = pathChunks[i];

      // if pathChunk is a parameter, then it matches any value, so we don't need to compare
      if (pathChunk.startsWith(':')) {
        continue;
      }

      // only last parameter can be optional, and if it is optional, so we don't need to compare
      if (pathChunk.endsWith('?')) {
        continue;
      }

      if (locationChunk !== pathChunk) return false;
    }

    return true;
  }

  function getRoute(config: Array<RouteConfig>, location: string) {
    const route = Object.values(config).find((route) => matchRoute(route, location));
    return route;
  }

  function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    return params;
  }

  function processRoutes(config: RouterConfig) {
    const routes: Array<RouteConfig> = [];
    forEachArray(config, route => {
      const flattenedRoutes = _flattenRoute(route);
      routes.push(...flattenedRoutes);
    })

    return routes;
  }

  return {
    getPath,
    getHash,
    getRoute,
    getQueryParams,

    processRoutes,
  };
};

export const RouterUtils = getRouterUtils();
