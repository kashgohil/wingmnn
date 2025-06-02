import { KeyboardEvent } from "react";

export function click(fn: (e: KeyboardEvent<HTMLElement>) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    switch (e.code) {
      case "Enter":
      case "Space":
        fn(e);
        break;
      default:
        break;
    }
  };
}
