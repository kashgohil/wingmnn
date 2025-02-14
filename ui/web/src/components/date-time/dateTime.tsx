import React from "react";

export interface DateTimeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  value: string;
}

export function DateTime(props: DateTimeProps) {
  return <div></div>;
}
