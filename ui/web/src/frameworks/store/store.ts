import { useSyncExternalStore } from "react";

export function create<T>(
  creator: (
    set: (value: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: (key: keyof T) => T[keyof T],
  ) => T,
) {
  function set(value: Partial<T> | ((state: T) => Partial<T>)) {
    let updates = value;
    if (typeof value === "function") updates = value(_store);
    Object.assign({}, _store, updates);

    for (const key in updates) {
      for (const subscriber of _subscribers[key]) {
        subscriber();
      }
    }
  }

  function get(key: keyof T) {
    return _store[key];
  }

  const _store = creator(set, get);
  const _subscribers: MapOf<Set<() => void>> = {};

  function subscribe(subscribe: () => void, key: keyof T) {
    if (!_subscribers[key as string])
      _subscribers[key as string] = new Set([subscribe]);
    else _subscribers[key as string].add(subscribe);

    return () => {
      _subscribers[key as string].delete(subscribe);
    };
  }

  return function useState(key: keyof T) {
    return useSyncExternalStore(
      (subscribeFn) => subscribe(subscribeFn, key),
      () => get(key),
    );
  };
}
