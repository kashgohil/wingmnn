import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import React, { ChangeEvent } from "react";

export interface InputProps<T>
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange" | "size" | "value"
  > {
  value?: T;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
  variant?: "outlined" | "underlined" | "normal";
  adornments?: { start?: () => React.ReactNode; end?: () => React.ReactNode };
  onChange(value: T, event: ChangeEvent<HTMLInputElement>): void;
}

const variantClasses = classVariance({
  normal: "rounded-lg",
  outlined: "rounded-lg",
  underlined: "",

  sm: "p-2",
  md: "p-3",
  lg: "p-4",
});

const wrapperVariantClasses = classVariance({
  normal: "rounded-lg",
  outlined:
    "rounded-lg border border-white-950 focus-within:border-transparent",
  underlined: "border-b border-white-950",

  sm: "",
  md: "",
  lg: "",

  disabled: "opacity-50 cursor-not-allowed",
});

export function Input<
  T extends string | number | readonly string[] | undefined,
>(props: InputProps<T>) {
  const {
    className,
    disabled,
    onChange,
    size = "md",
    variant = "normal",
    adornments,
    wrapperClassName,
    ...rest
  } = props;

  const changeHandler = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T, e);
    },
    [onChange],
  );

  const start = adornments?.start?.();
  const end = adornments?.end?.();

  return (
    <div
      className={cx(
        "flex items-center focus-within:outline-white-500 focus-within:outline-2 focus-within:outline-offset-2 transition-all duration-100",
        wrapperVariantClasses(variant, size, disabled ? "disabled" : undefined),
        wrapperClassName,
      )}
    >
      {start ? (
        <div className="flex items-center justify-center mr-1">{start}</div>
      ) : null}
      <input
        {...rest}
        disabled={disabled}
        onChange={changeHandler}
        className={cx(
          "flex-1 transition-all duration-100 outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:!text-white-400/40",
          variantClasses(variant, size),
          className,
        )}
      />
      {end ? (
        <div className="flex items-center justify-center ml-1">{end}</div>
      ) : null}
    </div>
  );
}
