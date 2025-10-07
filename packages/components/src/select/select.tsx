import { IconButton } from "@components/iconButton/iconButton";
import { Input, type InputProps } from "@components/input/input";
import { Menu } from "@components/menu/menu";
import type { Option } from "@components/types";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { castArray, find, map, some, without } from "@wingmnn/utils";
import { useBoolean } from "@wingmnn/utils/hooks";
import { X } from "lucide-react";
import React from "react";

interface BaseSelectProps
  extends Omit<InputProps<string>, "value" | "onChange"> {
  options: Array<Option>;
  variant?: "outlined" | "underlined" | "normal";
}

interface SingleSelectProps extends BaseSelectProps {
  multi?: false;
  value: string;
  onChange(value: string): void;
}

interface MultiSelectProps extends BaseSelectProps {
  multi: true;
  value: Array<string>;
  onChange(value: Array<string>): void;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

const variantClasses = classVariance({
  outlined: "rounded-lg bg-black-200 border border-black-400",
  underlined: "border-b border-black-400 bg-black-200",
  normal: "rounded-lg bg-black-200",
});

export function SelectWithOptions(props: SelectProps) {
  const {
    multi,
    className,
    onChange,
    value,
    options,
    variant = "normal",
    ref,
    ...rest
  } = props;

  const { value: open, unset } = useBoolean(false);
  const [keyword, setKeyword] = React.useState<string>();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const valueString = React.useMemo(() => {
    return map(
      castArray(value),
      (value) => find(options, ({ id }) => id === value)?.name,
    )
      .filter(Boolean)
      .join(", ");
  }, [value, options]);

  const selectHandler = React.useCallback(
    (option: Option) => {
      if (multi) {
        if (some(value, (value) => value === option.id)) {
          onChange(without(value, option.id));
        } else {
          onChange([...value, option.id]);
        }
      } else {
        onChange(option.id);
      }
    },
    [value, multi, onChange],
  );

  React.useImperativeHandle(ref, () => inputRef.current!);

  return (
    <>
      <Input
        {...rest}
        ref={inputRef}
        key={`${open}`}
        value={open ? keyword : valueString}
        adornments={{
          ...props.adornments,
          end: () => (
            <IconButton
              icon={X}
              size="sm"
              iconProps={{ size: 16 }}
              onClick={() => setKeyword("")}
            />
          ),
        }}
        className={cx(className, variantClasses(variant))}
        onChange={(keyword: string) => setKeyword(keyword)}
      />
      <Menu
        open={open}
        value={value}
        onClose={unset}
        options={options}
        anchor={inputRef}
        placement="bottom-left"
        onSelect={selectHandler}
      />
    </>
  );
}
