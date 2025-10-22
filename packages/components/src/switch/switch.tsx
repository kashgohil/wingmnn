import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { withSlideSound } from "@wingmnn/utils/interactivity";
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
	sm: "h-4 w-8 p-0.5",
	lg: "h-6 w-12 p-1.5",
	md: "h-5 w-10 p-1",
});

const knobVariantClasses = classVariance({
	sm: "w-4 h-4",
	lg: "w-6 h-6",
	md: "w-5 h-5",
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
				onClick={withSlideSound(clickHandler)}
				className={cx(
					className,
					variantClasses(size),
					"relative rounded-full cursor-pointer transition-colors duration-200",
					checked
						? "bg-accent/50 hover:bg-accent/40"
						: "bg-accent/10 hover:bg-accent/20",
				)}
			>
				<div
					className={cx(
						knobWrapperClassName,
						knobVariantClasses(size),
						"absolute top-0 left-0 rounded-full bg-accent border border-black shadow-md transition-transform duration-200 flex items-center justify-center",
						checked ? "translate-x-full" : "translate-x-0",
					)}
				>
					{knob}
				</div>
			</div>
		);
	}

	if (message) {
		return (
			<div className="flex items-center space-x-2">
				{comp()}
				<span>{message}</span>
			</div>
		);
	}

	return comp();
}
