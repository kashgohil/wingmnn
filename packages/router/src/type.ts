export interface RouteConfig {
  id: string;
  name?: string;
  path: string;
  description?: string;
  childRoutes?: Array<RouteConfig>;
  Component: React.ComponentType<any>;
}

export type RouterConfig = Array<RouteConfig>;
