import { cx } from "@utility/cx";
import { map } from "@wingmnn/utils";
import React from "react";

export interface RadioProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  value: string;
  message?: React.ReactNode;
  wrapperClassName?: string;
  onChange(value: string): void;
}

export interface RadioGroupProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  value: string;
  options: Array<Option>;
  onChange(values: string): void;
}

export function RadioGroup(props: RadioGroupProps) {
  const { className, options, onChange, value, ...rest } = props;

  return (
    <div className={cx(className)} {...rest}>
      {map(options, (option) => {
        return (
          <Radio
            value={option.id}
            onChange={onChange}
            checked={option.id === value}
          />
        );
      })}
    </div>
  );
}

export function Radio(props: RadioProps) {
  const { className, message, checked, wrapperClassName, onChange, ...rest } =
    props;

  const changeHandler = React.useCallback(() => {
    onChange(props.value);
  }, [onChange, props.value]);

  function comp() {
    return (
      <input
        {...rest}
        type="radio"
        checked={checked}
        onChange={changeHandler}
        className={cx(className)}
      />
    );
  }

  if (message) {
    return (
      <div
        tabIndex={0}
        onClick={changeHandler}
        className={cx(wrapperClassName, "flex items-center space-x-2")}
      >
        {comp()}
        <span>{message}</span>
      </div>
    );
  }

  return comp();
}
