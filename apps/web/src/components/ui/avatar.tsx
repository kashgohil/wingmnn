import { cn } from "@/lib/utils";
import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	name: string;
	imageUrl?: string;
	size?: "sm" | "md" | "lg";
}

function getInitials(name: string): string {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return name[0]?.toUpperCase() || "?";
}

export function Avatar({
	name,
	imageUrl,
	size = "md",
	className,
	...props
}: AvatarProps) {
	const initials = getInitials(name);
	const sizeClasses = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-12 w-12 text-base",
	};

	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-none bg-primary/10 text-primary font-semibold font-mono retro-border overflow-hidden",
				sizeClasses[size],
				className,
			)}
			{...props}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={name}
					className="h-full w-full object-cover"
				/>
			) : (
				<span>{initials}</span>
			)}
		</div>
	);
}
