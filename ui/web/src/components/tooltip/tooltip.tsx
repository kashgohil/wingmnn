import { Popover, PopoverProps } from "@components/popover/popover";
import { useBoolean } from "@hooks/useBoolean";
import React from "react";
import ReactDOM from "react-dom";

export interface TooltipProps
  extends Omit<
    PopoverProps,
    "title" | "ref" | "placement" | "open" | "onClose" | "anchor"
  > {
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: PopoverProps["placement"];
}

export function Tooltip(props: TooltipProps) {
  const { children, title, placement = "right", ...rest } = props;

  const ref = React.useRef(null);
  const { value: open, toggle } = useBoolean(false);

  const component = ReactDOM.createPortal(
    <Popover
      {...rest}
      open={open}
      anchor={ref}
      onClose={toggle}
      placement={placement}
      transition={{ delay: 0.3 }}
      className="!ml-2 !bg-white-500 !text-black-200 !text-xs"
    >
      {title}
    </Popover>,
    document.getElementById("popover-root")!,
  );

  return (
    <>
      <div ref={ref} onMouseOver={toggle} onMouseOut={toggle}>
        {children}
      </div>
      {component}
    </>
  );
}
