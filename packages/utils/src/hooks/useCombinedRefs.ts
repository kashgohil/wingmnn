import React from "react";

export function useCombinedRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") ref(node);
        else (ref as React.RefObject<T | null>).current = node;
      });
    },
    [refs],
  );
}
