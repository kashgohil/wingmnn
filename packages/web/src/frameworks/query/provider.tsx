import React from "react";
import { QueryContext } from "./context";

interface Props {
  value: React.ContextType<typeof QueryContext>;
}

export function QueryProvider(props: React.PropsWithChildren<Props>) {
  const { children, value } = props;

  return <QueryContext value={value}>{children}</QueryContext>;
}
