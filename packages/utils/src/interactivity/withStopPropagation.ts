import type { EventHandler } from "react";

export function withStopPropagation(
  handler: EventHandler<TSAny>,
): EventHandler<TSAny> {
  return (event: Event) => {
    handler(event);
    event.stopPropagation();
  };
}
