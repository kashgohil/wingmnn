import React, { useLayoutEffect } from "react";

function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  isActive: boolean,
) {
  useLayoutEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = getFocusableElements(element);
    const firstElement = focusableElements[0];

    firstElement?.focus();

    function handleFocus(e: FocusEvent) {
      if (!element.contains(e.target as Node)) {
        firstElement?.focus();
      }
    }

    // Ensure focus stays within the trap
    document.addEventListener("focus", handleFocus, true);

    return () => {
      document.removeEventListener("focus", handleFocus, true);
    };
  }, [isActive, ref]);
}
