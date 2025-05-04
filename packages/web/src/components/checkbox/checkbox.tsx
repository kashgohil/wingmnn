import { cx } from "@utility/cx";
import { forEach } from "@utility/forEach";
import { map } from "@utility/map";
import { without } from "@utility/without";
import React from "react";

export interface CheckboxProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  value: string;
  wrapperClassName?: string;
  message?: React.ReactNode;
  onChange(checked: boolean, value: string): void;
}

export interface CheckboxGroupProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  value: Array<string>;
  options: Array<Option>;
  onChange(values: Array<string>): void;
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const { className, options, onChange, value, ...rest } = props;

  const checked = React.useMemo(() => {
    const checked: MapOf<boolean> = {};

    forEach(value, (value) => {
      checked[value] = true;
    });

    return checked;
  }, [value]);

  const changeHandler = React.useCallback(
    (checked: boolean, id: string) => {
      if (checked) {
        onChange([...value, id]);
      } else {
        onChange(without(value, id));
      }
    },
    [value, onChange],
  );

  return (
    <div className={cx(className)} {...rest}>
      {map(options, (option) => {
        return (
          <Checkbox
            value={option.id}
            onChange={changeHandler}
            checked={checked[option.id]}
          />
        );
      })}
    </div>
  );
}

export function Checkbox(props: CheckboxProps) {
  const {
    className,
    onChange,
    message = "",
    wrapperClassName = "",
    ...rest
  } = props;

  const changeHandler = React.useCallback(() => {
    onChange(!props.checked, props.value);
  }, [onChange, props.checked, props.value]);

  function comp() {
    return (
      <input
        {...rest}
        type="checkbox"
        className={cx(className)}
        onChange={changeHandler}
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
