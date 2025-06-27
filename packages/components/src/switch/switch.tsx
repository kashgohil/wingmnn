import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import React, { type MouseEvent } from "react";

export interface SwitchProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  checked: boolean;
  knob?: React.ReactNode;
  message?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  knobWrapperClassName?: string;
  onChange(value: boolean): void;
}

const variantClasses = classVariance({
  sm: "h-3 w-6 p-0.5",
  lg: "h-5 w-10 p-1.5",
  md: "h-4 w-8 p-1",
});

const knobVariantClasses = classVariance({
  sm: "w-3 p-0.5",
  lg: "w-5 p-1",
  md: "w-4 p-1",
});

export function Switch(props: SwitchProps) {
  const {
    knob,
    message,
    checked,
    onClick,
    onChange,
    size = "md",
    className = "",
    knobWrapperClassName = "",
    ...rest
  } = props;

  const clickHandler = React.useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      onChange(!checked);
      onClick?.(e);
    },
    [checked, onClick, onChange],
  );

  function comp() {
    return (
      <div
        {...rest}
        tabIndex={0}
        onClick={clickHandler}
        className={cx(className, variantClasses(size), "relative")}
      >
        <div
          className={cx(
            knobWrapperClassName,
            knobVariantClasses(size),
            "h-full rounded-full flex items-center justify-center",
          )}
        >
          {knob}
        </div>
      </div>
    );
  }

  if (message) {
    <div className="flex items-center space-x-2">
      {comp()}
      <span>{message}</span>
    </div>;
  }

  return comp();
}
