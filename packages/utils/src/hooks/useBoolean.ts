import React from "react";

export function useBoolean(initialValue: boolean) {
  const [value, action] = React.useState(initialValue);

  function toggle() {
    action((value) => !value);
  }

  function set() {
    action(true);
  }

  function unset() {
    action(false);
  }

  return { value, toggle, set, unset };
}
