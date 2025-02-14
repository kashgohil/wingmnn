import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import React, { ChangeEvent } from "react";

export interface InputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange" | "size"
  > {
  value?: string | number;
  size?: "sm" | "md" | "lg";
  variant?: "outlined" | "underlined" | "normal";
  adornments?: { start?: () => React.ReactNode; end?: () => React.ReactNode };
  onChange(value: string | number, event: ChangeEvent<HTMLInputElement>): void;
}

const variantClasses = classVariance({
  normal: "rounded-lg",
  outlined: "rounded-lg border border-black-50",
  underlined: "border-b border-black-400",

  sm: "p-2",
  md: "p-3",
  lg: "p-4",
});

const wrapperVariantClasses = classVariance({
  normal: "rounded-lg",
  outlined: "rounded-lg",
  underlined: "border-b border-black-400",
  sm: "",
  md: "",
  lg: "",
});

export function Input(props: InputProps) {
  const {
    className,
    onChange,
    size = "md",
    variant = "normal",
    adornments,
    ...rest
  } = props;

  const changeHandler = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value, e);
    },
    [onChange],
  );

  const start = adornments?.start?.();
  const end = adornments?.end?.();

  return (
    <div
      className={cx(
        "flex items-center focus-within:outline-white",
        wrapperVariantClasses(variant, size),
      )}
    >
      {start ? (
        <div className="flex items-center justify-center mr-1">{start}</div>
      ) : null}
      <input
        {...rest}
        onChange={changeHandler}
        className={cx(
          "flex-1 transition-all duration-100 bg-transparent placeholder:text-white-100 focus-within:outline-black-200 focus-within:outline-2 outline-offset-2",
          variantClasses(variant, size),
          className,
        )}
      />
      {start ? (
        <div className="flex items-center justify-center ml-1">{end}</div>
      ) : null}
    </div>
  );
}
