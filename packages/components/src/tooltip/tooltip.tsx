import { cx } from "@utility/cx";
import { useBoolean } from "@wingmnn/utils/hooks";
import React from "react";
import { Popover, type Placement, type PopoverProps } from "../popover/popover";

// Re-export for better IntelliSense
export type TooltipContentProps = Omit<
  PopoverProps,
  "open" | "anchor" | "onClose" | "placement"
>;

export type TooltipTriggerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export interface TooltipProps {
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
  style?: React.CSSProperties;
}

const TooltipContext = React.createContext<{
  open: boolean;
  toggle: () => void;
  placement?: Placement;
  ref?: React.RefObject<HTMLDivElement | null>;
}>({
  open: false,
  toggle: () => {},
  placement: "right",
  ref: undefined,
});

export function Tooltip(props: TooltipProps) {
  const { children } = props;

  const ref = React.useRef<HTMLDivElement>(null);
  const { value: open, toggle } = useBoolean(false);

  return (
    <TooltipContext.Provider
      value={{ open, toggle, placement: props.placement, ref }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  const { className, ...rest } = props;
  const { toggle, ref } = React.useContext(TooltipContext);

  return (
    <div
      {...rest}
      ref={ref}
      className={cx("cursor-pointer", className)}
      onMouseEnter={toggle}
      onMouseLeave={toggle}
    >
      {props.children}
    </div>
  );
}

export function TooltipContent(props: TooltipContentProps) {
  const { children, className, transition, ...rest } = props;

  const {
    open,
    toggle,
    ref,
    placement: contextPlacement = "right",
  } = React.useContext(TooltipContext);

  if (!ref?.current) return null;

  return (
    <Popover
      {...rest}
      open={open}
      anchor={ref}
      onClose={toggle}
      root="tooltip-root"
      placement={contextPlacement}
      transition={{ delay: 0.2, ...transition }}
      className={cx(
        "bg-accent text-[var(--accent-text)] text-xs rounded-lg whitespace-nowrap z-[52]",
        className,
      )}
    >
      {children}
    </Popover>
  );
}
