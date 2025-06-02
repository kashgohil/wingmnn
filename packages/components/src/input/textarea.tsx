import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import React, { ChangeEvent } from "react";

export interface TextAreaProps
  extends Omit<
    React.DetailedHTMLProps<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >,
    "onChange" | "size"
  > {
  value?: string | number;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
  variant?: "outlined" | "underlined" | "normal";
  onChange(value: string, event: ChangeEvent<HTMLTextAreaElement>): void;
}

const variantClasses = classVariance({
  normal: "rounded-lg",
  outlined: "rounded-lg border border-white-950",
  underlined: "border-b border-white-950",

  sm: "p-2",
  md: "p-3",
  lg: "p-4",
});

export const TextArea = (props: TextAreaProps) => {
  const { value, size, className, variant, onChange, ...rest } = props;
  const changeHandler = React.useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value, e);
    },
    [onChange],
  );
  return (
    <textarea
      {...rest}
      value={value}
      onChange={changeHandler}
      className={cx(
        "rounded-lg bg-transparent px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white-500 focus-within:border-transparent transition-all duration-100 placeholder:!text-white-400/40",
        variantClasses(variant, size),
        className,
      )}
    />
  );
};
