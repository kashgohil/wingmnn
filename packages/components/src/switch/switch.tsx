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
	sm: "w-8 h-4",
	lg: "w-12 h-6",
	md: "w-10 h-5",
});

const knobVariantClasses = classVariance({
	sm: "w-2.5 h-2.5",
	lg: "w-4.5 h-4.5",
	md: "w-3.5 h-3.5",
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
					"relative rounded-full flex items-center cursor-pointer transition-all duration-200 border border-accent/80 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent/80 p-1",
					checked
						? "bg-accent/40 hover:bg-accent/30"
						: "bg-accent/5 hover:bg-accent/10",
				)}
			>
				<div
					className={cx(
						knobWrapperClassName,
						knobVariantClasses(size),
						"absolute top-1/2 -translate-y-1/2 rounded-full bg-accent transition-all duration-200",
						checked
							? "left-[calc(100%-2px)] -translate-x-full"
							: "left-0.5 translate-x-0",
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
