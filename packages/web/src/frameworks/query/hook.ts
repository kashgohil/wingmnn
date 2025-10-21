import { tryCatch } from "@wingmnn/utils";
import { useForceRender } from "@wingmnn/utils/hooks";
import React from "react";
import { QueryContext } from "./context";
import { type Params, Query, type QueryParams } from "./query";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type QueryBase<S> = {
  refetch: () => void;
  isRefetching: boolean;
};

type QueryIdle<S> = QueryBase<S> & {
  status: "idle";
  result: null;
  error: null;
  isIdle: true;
  isLoading: false;
  isError: false;
  isSuccess: false;
};

type QueryLoading<S> = QueryBase<S> & {
  status: "fetching";
  result: null;
  error: null;
  isIdle: false;
  isLoading: true;
  isError: false;
  isSuccess: false;
};

type QueryError<S> = QueryBase<S> & {
  status: "error";
  result: null;
  error: Error;
  isIdle: false;
  isLoading: false;
  isError: true;
  isSuccess: false;
};

type QuerySuccess<S> = QueryBase<S> & {
  status: "success";
  result: S;
  error: null;
  isIdle: false;
  isLoading: false;
  isError: false;
  isSuccess: true;
};

type QueryMutating<S> = QueryBase<S> & {
  status: "mutating";
  result: S;
  error: null;
  isIdle: false;
  isLoading: false;
  isError: false;
  isSuccess: false;
};

type QueryResponse<S> =
  | QueryIdle<S>
  | QueryLoading<S>
  | QueryError<S>
  | QuerySuccess<S>
  | QueryMutating<S>;

type UseQueryParams<T, K, S = T> = Required<Pick<Params<T, K, S>, "queryFn">> &
  Omit<Params<T, K, S>, "queryFn" | "onMutate">;

type UseMutationParams<T, K, S = T, MArgs extends TSAny[] = TSAny[]> = Required<
  Pick<Params<T, K, S, MArgs>, "mutationFn">
> &
  Omit<Params<T, K, S, MArgs>, "mutationFn" | "enabled">;

export type CustomQueryParams = Pick<
  Params<unknown, unknown, unknown>,
  "debounce" | "enabled" | "polling" | "staleTime"
>;

export function useQuery<T, K, S = T>(
  params: UseQueryParams<T, K, S>,
): QueryResponse<S> {
  const { cache, batch } = React.useContext(QueryContext);
  const forceRender = useForceRender();

  const [query] = React.useState<Query<T, K, S>>(
    new Query<T, K, S>(cache, batch, params, forceRender),
  );

  query.updateParams(params);

  const status = query.status;
  const base: QueryBase<S> = {
    refetch: query.refetch,
    isRefetching: query.refetching && status === "fetching",
  };

  switch (status) {
    case "idle":
      return {
        ...base,
        status,
        result: null,
        error: null,
        isIdle: true,
        isLoading: false,
        isError: false,
        isSuccess: false,
      };
    case "fetching":
      return {
        ...base,
        status,
        result: null,
        error: null,
        isIdle: false,
        isLoading: true,
        isError: false,
        isSuccess: false,
      };
    case "error":
      return {
        ...base,
        status,
        result: null,
        error: query.error!,
        isIdle: false,
        isLoading: false,
        isError: true,
        isSuccess: false,
      };
    case "success":
      return {
        ...base,
        status,
        result: query.result as S,
        error: null,
        isIdle: false,
        isLoading: false,
        isError: false,
        isSuccess: true,
      };
    case "mutating":
    default:
      return {
        ...base,
        status: "mutating",
        result: query.result as S,
        error: null,
        isIdle: false,
        isLoading: false,
        isError: false,
        isSuccess: false,
      };
  }
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
