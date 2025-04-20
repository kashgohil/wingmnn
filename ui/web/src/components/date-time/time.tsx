import React from "react";

export interface TimeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  value: string;
}

export function Time(props: TimeProps) {
  const { value } = props;

  return <div>{value}</div>;
}
