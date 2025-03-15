import { get as _get } from "@utility/get";
import { isEqual } from "@utility/isEqual";
import { useSyncExternalStore } from "react";

export function create<TState, TActions>(
  creator: (
    set: (
      value: Partial<TState> | ((state: TState) => Partial<TState>),
    ) => void,
    get: <TKey extends keyof TState | keyof TActions>(
      key: TKey,
    ) => TKey extends keyof TState
      ? TState[TKey]
      : TKey extends keyof TActions
        ? TActions[TKey]
        : never,
  ) => TState & TActions,
) {
  function set(value: Partial<TState> | ((state: TState) => Partial<TState>)) {
    let updates: TSAny = value;
    if (typeof value === "function") updates = value(_store);

    const finalUpdates: TSAny = {};

    for (const key in updates) {
      if (!isEqual(_get(_store, key), updates[key])) {
        finalUpdates[key] = updates[key];
      }
    }

    _store = Object.assign({}, _store, finalUpdates);

    for (const key in finalUpdates) {
      if (_subscribers[key]) {
        for (const subscriber of _subscribers[key]) {
          subscriber();
        }
      }
    }
  }

  function get<TKey extends keyof TState | keyof TActions>(key: TKey) {
    return _store[key] as TKey extends keyof TState
      ? TState[TKey]
      : TKey extends keyof TActions
        ? TActions[TKey]
        : never;
  }

  let _store = creator(set, get);
  const _subscribers: MapOf<Set<() => void>> = {};

  function subscribe(
    subscribe: () => void,
    key: keyof TState | keyof TActions,
  ) {
    if (typeof _store[key] === "function") return () => {};
    if (!_subscribers[key as string]) {
      _subscribers[key as string] = new Set([subscribe]);
    }
    _subscribers[key as string].add(subscribe);

    return () => {
      _subscribers[key as string].delete(subscribe);
    };
  }

  return function useState<TKey extends keyof TState | keyof TActions>(
    key: TKey,
  ) {
    const useState = useSyncExternalStore<
      TKey extends keyof TState
        ? TState[TKey] & {
            get: (
              key: TKey,
            ) => TKey extends keyof TState
              ? TState[TKey]
              : TKey extends keyof TActions
                ? TActions[TKey]
                : never;
            set: (value: Partial<TState>) => void;
          }
        : TKey extends keyof TActions
          ? TActions[TKey] & {
              get: (
                key: TKey,
              ) => TKey extends keyof TState
                ? TState[TKey]
                : TKey extends keyof TActions
                  ? TActions[TKey]
                  : never;
              set: (value: Partial<TState>) => void;
            }
          : never
    >(
      (subscribeFn) => subscribe(subscribeFn, key),
      () => get(key) as TSAny,
    );

    useState.get = get;
    useState.set = set;

    return useState;
  };
}
