import { tryCatch } from "@wingmnn/utils";
import { useForceRender } from "@wingmnn/utils/hooks";
import React from "react";
import { QueryContext } from "./context";
import { type Params, Query, type QueryParams } from "./query";

interface QueryResponse<S> {
  result: S | null;
  error: Error | null;
  status: "idle" | "fetching" | "error" | "success" | "mutating";
  refetch: () => void;
  isRefetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

type UseQueryParams<T, K, S = T> = Required<Pick<Params<T, K, S>, "queryFn">> &
  Omit<Params<T, K, S>, "queryFn" | "onMutate">;

type UseMutationParams<T, K, S = T, MArgs extends TSAny[] = TSAny[]> = Required<
  Pick<Params<T, K, S, MArgs>, "mutationFn">
> &
  Omit<Params<T, K, S, MArgs>, "mutationFn" | "enabled">;

export function useQuery<T, K, S = T>(
  params: UseQueryParams<T, K, S>,
): QueryResponse<S> {
  const { cache, batch } = React.useContext(QueryContext);
  const forceRender = useForceRender();

  const [query] = React.useState<Query<T, K, S>>(
    new Query<T, K, S>(cache, batch, params, forceRender),
  );

  query.updateParams(params);

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

export function useQueryState<T, K = unknown>(key: QueryParams<K>) {
  const { cache, keyFn } = React.useContext(QueryContext);
  const forceRender = useForceRender();

  const serializedKey = React.useMemo(() => {
    return keyFn(key);
  }, [key, keyFn]);

  const { result, error } = tryCatch(() =>
    cache.get(serializedKey, forceRender),
  );

  if (error) return null;
  return result as T;
}

export function useQueryStateWithAction<T, K = unknown>(key: QueryParams<K>) {
  const { cache, keyFn } = React.useContext(QueryContext);
  const [state, setState] = React.useState<T>();

  const serializedKey = React.useMemo(() => {
    return keyFn(key);
  }, [key, keyFn]);

  const setKey = React.useCallback(<K extends keyof T>(key: K) => {
    return (value: T[K]) =>
      setState((draft) => {
        if (draft) {
          return Object.assign(draft, { [key]: value });
        } else {
          return { [key]: value } as T;
        }
      });
  }, []);

  React.useEffect(() => {
    setState(cache.get(serializedKey, setState));
  }, [serializedKey, cache]);

  return [state, setState, setKey] as [
    T | undefined,
    React.Dispatch<React.SetStateAction<T | undefined>>,
    <K extends keyof T>(key: K) => (value: T[K]) => void,
  ];
}

export function useMutation<T, K, S = T, MArgs extends TSAny[] = TSAny[]>(
  params: UseMutationParams<T, K, S, MArgs>,
) {
  const { cache, batch } = React.useContext(QueryContext);
  const forceRender = useForceRender();

  const [query] = React.useState<Query<T, K, S, MArgs>>(
    new Query<T, K, S, MArgs>(
      cache,
      batch,
      { ...params, enabled: false },
      forceRender,
    ),
  );

  query.updateParams(params);

  return {
    error: query.error,
    status: query.status,

    mutate: query.mutate,

    isMutating: query.status === "mutating",
    isSuccess: query.status === "success",
    isError: query.status === "error",
    isIdle: query.status === "idle",
  };
}
