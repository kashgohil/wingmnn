import React from "react";

export interface DateRangeProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  value: [string, string];
  onChange(value: [string, string]): void;
}

export function DateRange(props: DateRangeProps) {
  return <div></div>;
}
