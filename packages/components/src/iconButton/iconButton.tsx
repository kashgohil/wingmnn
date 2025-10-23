import { Button } from "@components/button/button";
import { cx } from "@utility/cx";
import { type LucideProps } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: React.JSXElementConstructor<LucideProps>;
	shape?: "circle" | "rounded" | "square";
	iconProps?: LucideProps;
	className?: string;
	variant?: "primary" | "secondary" | "icon" | "stripped";
	size?: "sm" | "md" | "lg";
	noSound?: boolean;
}

export function IconButton(props: IconButtonProps) {
	const {
		icon: Icon,
		shape = "rounded",
		iconProps = {},
		className,
		variant = "icon",
		...rest
	} = props;

	if (!Icon) return null;

	if (shape === "circle") {
		return (
			<Button
				{...rest}
				variant={variant}
				className={cx(
					"flex items-center justify-center rounded-full",
					className,
				)}
			>
				<Icon {...iconProps} />
			</Button>
		);
	}

	if (shape === "rounded") {
		return (
			<Button
				{...rest}
				variant={variant}
				className={cx("flex items-center justify-center rounded-lg", className)}
			>
				<Icon {...iconProps} />
			</Button>
		);
	}

	if (shape === "square") {
		return (
			<Button
				{...rest}
				variant={variant}
				className={cx(
					"flex items-center justify-center rounded-none",
					className,
				)}
			>
				<Icon {...iconProps} />
			</Button>
		);
	}
}
