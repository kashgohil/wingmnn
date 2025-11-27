"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface CheckboxProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"type" | "checked"
	> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			onCheckedChange?.(e.target.checked);
			onChange?.(e);
		};

		return (
			<label className="relative inline-flex items-center cursor-pointer">
				<input
					type="checkbox"
					ref={ref}
					checked={checked}
					onChange={handleChange}
					className="sr-only"
					{...props}
				/>
				<div
					className={cn(
						"flex h-4 w-4 shrink-0 items-center justify-center rounded-none border-2 border-border bg-background ring-offset-background transition-colors cursor-pointer",
						"focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
						"disabled:cursor-not-allowed disabled:opacity-50",
						checked &&
							"bg-primary text-primary-foreground border-primary",
					)}
				>
					{checked && <Check className="h-3 w-3 text-primary-foreground" />}
				</div>
			</label>
		);
	},
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

