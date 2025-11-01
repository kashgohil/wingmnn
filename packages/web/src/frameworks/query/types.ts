import type { QueryFunctionContext } from "@tanstack/react-query";

type Params<T = undefined> = [
  {
    primaryKey: string;
    secondaryKey?: string;
    params?: T;
  },
];

export type QueryParams<T = undefined> = QueryFunctionContext<Params<T>>;

export type QueryOptions = {
  enabled?: boolean;
};
