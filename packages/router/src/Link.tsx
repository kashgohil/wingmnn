import React from "react";
import { RouterUtils } from "./utils";

export interface LinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  to: string;
}

export function Link(props: LinkProps) {
  const { children, onClick, ...rest } = props;

  const clickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (onClick) onClick(event);
    RouterUtils.goTo(props.to);
  };

  return (
    <a href={props.to} onClick={clickHandler} {...rest}>
      {children}
    </a>
  );
}
