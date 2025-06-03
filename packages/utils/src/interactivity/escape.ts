import { type KeyboardEvent } from "react";

export function escape(fn: (e: KeyboardEvent<HTMLElement>) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    console.log(e);
    switch (e.code) {
      case "Escape":
        fn(e);
        break;
      default:
        break;
    }
  };
}
