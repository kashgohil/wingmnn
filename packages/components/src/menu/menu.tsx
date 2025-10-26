import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { castArray, filter, forEach, map } from "@wingmnn/utils";
import { useFocusTrap } from "@wingmnn/utils/hooks";
import { withStopPropagation } from "@wingmnn/utils/interactivity";
import React, { type KeyboardEvent } from "react";
import { Popover, type PopoverProps } from "../popover/popover";
import type { InferredType, Option } from "../types";

export interface MenuProps<T> extends Omit<PopoverProps, "onSelect"> {
  open: boolean;
  onClose(): void;
  options: Array<Option>;
  value:
    | InferredType<T, string | number>
    | Array<InferredType<T, string | number>>;
  onSelect?(option: Option): void;
  variant?: PopoverProps["variant"];
  placement: PopoverProps["placement"];
  anchor: React.RefObject<HTMLElement | null>;
}

export interface MenuOptionProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  option: Option;
  selected?: boolean;
  variant: PopoverProps["variant"];
}

const optionVariantClasses = classVariance({
  compact: "px-2 py-1",
  normal: "px-4 py-2",
  selected: "bg-black-200/20",
});

function MenuOption(props: MenuOptionProps) {
  const { option, selected, className, variant = "normal", ...rest } = props;
  const { name, type = "value" } = option;

  switch (type) {
    case "value":
      return (
        <div
          {...rest}
          tabIndex={0}
          className={cx(
            optionVariantClasses(variant, selected ? "selected" : undefined),
            "rounded-lg cursor-pointer hover:bg-black-100 transition-all duration-200 focus-within:outline-black-200 focus-within:outline-2",
            className,
          )}
        >
          {name}
        </div>
      );
    case "heading":
      return (
        <div
          {...rest}
          tabIndex={-1}
          className={cx(
            optionVariantClasses(variant),
            "rounded-lg uppercase tracking-wide text-xs cursor-pointer",
            className,
          )}
        >
          {name}
        </div>
      );
    case "action":
      return (
        <div
          {...rest}
          tabIndex={0}
          className={cx(
            optionVariantClasses(variant, selected ? "selected" : undefined),
            "rounded-lg cursor-pointer hover:bg-black-300 transition-all duration-200 focus-within:outline-black-200 focus-within:outline-2",
            className,
          )}
        >
          {name}
        </div>
      );
  }
}

export function Menu<T>(props: MenuProps<T>) {
  const {
    ref,
    value,
    options,
    variant,
    className,
    onKeyDown,
    onClose,
    onSelect,
    ...rest
  } = props;

  const refs = React.useRef<MapOf<TSAny>>({});
  const currentIndex = React.useRef<number>(0);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const selectableOptions = React.useMemo(
    () => filter(options, (option) => option.type === "value"),
    [options],
  );

  const selectedOptions = React.useMemo(() => {
    const set = new Set();
    forEach(castArray(value), (value) => {
      set.add(value);
    });
    return set;
  }, [value]);

  const focusOption = React.useCallback(
    (index: number) => {
      const option = selectableOptions[index];
      if (option && refs.current[option.id]) {
        refs.current[option.id].focus();
        currentIndex.current = index;
      }
    },
    [selectableOptions],
  );

  const keydown = React.useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      } else {
        const len = selectableOptions.length;

        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            focusOption((currentIndex.current - 1 + len) % len);
            break;

          case "ArrowDown":
            e.preventDefault();
            focusOption((currentIndex.current + 1) % len);
            break;

          case "Enter":
          case " ": {
            e.preventDefault();
            const selectedOption = selectableOptions[currentIndex.current];
            if (selectedOption) {
              onSelect?.(selectedOption);
            }
            break;
          }

          case "Home":
            e.preventDefault();
            focusOption(0);
            break;

          case "End":
            e.preventDefault();
            focusOption(len - 1);
            break;

          case "Escape":
            e.preventDefault();
            onClose();
            break;
        }
      }
    },
    [onSelect, onKeyDown, onClose, selectableOptions, focusOption],
  );

  React.useImperativeHandle(ref, () => menuRef.current!);

  useFocusTrap(menuRef, props.open);

  return (
    <Popover
      {...rest}
      role="menu"
      ref={menuRef}
      onClose={onClose}
      variant={variant}
      onKeyDown={keydown}
      className={cx(className, "p-1 rounded-xl mt-1")}
    >
      {map(options, (option) => {
        const { type = "value" } = option;
        return (
          <MenuOption
            role="menuitem"
            key={option.id}
            option={option}
            variant={variant}
            tabIndex={type === "value" ? 0 : -1}
            selected={selectedOptions.has(option.id)}
            onClick={withStopPropagation(
              () => type === "value" && onSelect?.(option),
            )}
            ref={
              type === "value"
                ? (ref) => {
                    refs.current[option.id] = ref;
                  }
                : undefined
            }
          />
        );
      })}
    </Popover>
  );
}
