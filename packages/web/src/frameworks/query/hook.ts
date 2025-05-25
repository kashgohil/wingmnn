import React from "react";

interface QueryParams<T> {
  primaryKey: string;
  secondaryKey: string;
  params: T;
}

interface Params<T, K, S> {
  key: QueryParams<K>;
  queryFn: (queryParams: QueryParams<K>) => Promise<T>;
  staleTime?: number;
  selector?(response: T): S;
  onReject?(error: Error): void;
  onResolve?(response: T): void;
}

interface QueryResponse<S> {
  result: S | null;
  error: Error | null;
  status: "idle" | "fetching" | "error" | "success";
  refetch: () => void;
  isRefetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

import { MINUTE } from "@constants";
import { useForceRender } from "@hooks/useForceRender";
import { Query } from "./query";

export function useQuery<T, K, S = T>({
  key,
  queryFn,
  staleTime = MINUTE, // 1 minute default stale time
  selector,
  onReject,
  onResolve,
}: Params<T, K, S>): QueryResponse<S> {
  const forceRender = useForceRender();
  const [query] = React.useState<Query<T, K, S>>(
    new Query<T, K, S>(
      {
        key,
        queryFn,
        staleTime,
        selector,
        onReject,
        onResolve,
      },
      forceRender,
    ),
  );

  return {
    result: query.result,
    error: query.error,
    status: query.status,

    refetch: query.refetch,

    isRefetching: query.refetching && query.status === "fetching",
    isLoading: query.status === "fetching",
    isSuccess: query.status === "success",
    isError: query.status === "error",
    isIdle: query.status === "idle",
  };
}
