import type { InferredType } from "@components/types";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { useCombinedRefs } from "@wingmnn/utils/hooks";
import React, { type ChangeEvent } from "react";

export interface InputProps<T>
	extends Omit<
		React.DetailedHTMLProps<
			React.InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		"onChange" | "size" | "value"
	> {
	value?: InferredType<T, string | number>;
	size?: "sm" | "md" | "lg";
	delayedFocus?: number;
	wrapperClassName?: string;
	variant?: "outlined" | "underlined" | "normal";
	adornments?: { start?: () => React.ReactNode; end?: () => React.ReactNode };
	onChange(
		value: InferredType<T, string | number>,
		event: ChangeEvent<HTMLInputElement>,
	): void;
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
		"rounded-lg border border-accent/40 focus-within:border-transparent",
	underlined: "border-b border-accent/40",

	sm: "",
	md: "",
	lg: "",

	disabled: "opacity-50 cursor-not-allowed",
});

export function Input<T extends string | number = string>(
	props: InputProps<T>,
) {
	const {
		ref,
		autoFocus,
		delayedFocus,
		className,
		disabled,
		onChange,
		size = "md",
		variant = "normal",
		adornments,
		wrapperClassName,
		min,
		max,
		type,
		...rest
	} = props;

	const focused = !!delayedFocus ? false : autoFocus;

	const inputRef = React.useRef<HTMLInputElement>(null);

	const changeHandler = React.useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (
				min !== undefined &&
				type === "number" &&
				Number(e.target.value) < Number(min)
			) {
				e.target.value = min.toString();
			}
			if (
				max !== undefined &&
				type === "number" &&
				Number(e.target.value) > Number(min)
			) {
				e.target.value = max.toString();
			}
			onChange(e.target.value as InferredType<T, string | number>, e);
		},
		[onChange],
	);

	React.useEffect(() => {
		if (delayedFocus) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, delayedFocus);
		}
	}, [delayedFocus]);

	const combinedRef = useCombinedRefs(inputRef, ref);

	const start = adornments?.start?.();
	const end = adornments?.end?.();

	return (
		<div
			className={cx(
				"flex items-center focus-within:outline-accent/80 focus-within:outline-2 focus-within:outline-offset-2 transition-all duration-200",
				wrapperVariantClasses(variant, size, disabled ? "disabled" : undefined),
				wrapperClassName,
			)}
		>
			{start ? (
				<div className="flex items-center justify-center mr-1">{start}</div>
			) : null}
			<input
				{...rest}
				min={min}
				max={max}
				ref={combinedRef}
				autoFocus={focused}
				disabled={disabled}
				onChange={changeHandler}
				className={cx(
					"flex-1 transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:!text-accent/40 caret-accent",
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
