import { useSyncExternalStore } from "react";
import { Store } from "./store";

export function createStore<TState>(state: TState) {
  const store = new Store<TState>(state);

  function useState<TKey extends keyof TState>(key: TKey) {
    return useSyncExternalStore(
      (subscribe) => store.subscribe(key, subscribe),
      () => store.get(key),
    );
  }

  return { useState, store };
}
