import { cn } from "@/lib/utils";
import * as React from "react";

const badgeVariants =
	"inline-flex items-center rounded-none border border-border px-2.5 py-0.5 text-xs font-mono uppercase tracking-[0.3em]";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
	className,
	variant = "default",
	...props
}: BadgeProps) {
	const variantClasses =
		variant === "secondary"
			? "bg-muted text-muted-foreground"
			: variant === "destructive"
				? "bg-destructive text-destructive-foreground"
				: variant === "outline"
					? "border-border bg-transparent"
					: "bg-primary text-primary-foreground";

	return (
		<span
			className={cn(badgeVariants, variantClasses, className)}
			{...props}
		/>
	);
}
