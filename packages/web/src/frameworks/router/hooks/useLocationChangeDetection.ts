import React from "react";

const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function update() {
  for (const callback of subscribers) {
    callback();
  }
}

if (window) {
  window.addEventListener("popstate", update);
  window.addEventListener("pushState", update);
  window.addEventListener("replaceState", update);
  window.addEventListener("hashchange", update);

  window.onunload = () => {
    window.removeEventListener("popstate", update);
    window.removeEventListener("pushState", update);
    window.removeEventListener("replaceState", update);
    window.removeEventListener("hashchange", update);
  };
}

function getSnapshot() {
  return window.location.pathname;
}

export const useLocationChangeDetection = () => React.useSyncExternalStore(subscribe, getSnapshot)
