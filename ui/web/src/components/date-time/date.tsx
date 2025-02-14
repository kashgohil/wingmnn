import React from "react";

export interface DateProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  value: string;
  onChange(value: string): void;
}

export function Date() {
  return <div></div>;
}
