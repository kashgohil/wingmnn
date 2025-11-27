import type { Project } from "@/lib/api/projects.api";
import type { Task } from "@/lib/api/tasks.api";
import {
	getPriorityLabel,
	getPriorityMetadata,
	type PriorityValue,
} from "@/lib/priority";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

export function PriorityIcon({
	priority,
	className,
}: {
	priority: PriorityValue;
	className?: string;
}) {
	const meta = getPriorityMetadata(priority);
	const IconComponent = meta?.icon ?? Circle;

	return (
		<IconComponent
			className={cn("size-4", meta?.iconClassName, className)}
			aria-hidden="true"
		/>
	);
}

interface PriorityLabelProps {
	priority: Project["priority"] | Task["priority"] | null | undefined;
	className?: string;
	placeholder?: string;
	showIcon?: boolean;
	iconClassName?: string;
}

export function PriorityLabel({
	priority,
	className,
	placeholder = "Unset",
	showIcon = true,
	iconClassName,
}: PriorityLabelProps) {
	if (!priority) {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-2 text-muted-foreground",
					className,
				)}
			>
				{placeholder}
			</span>
		);
	}

	return (
		<span className={cn("inline-flex items-center gap-2", className)}>
			{showIcon ? (
				<PriorityIcon
					priority={priority}
					className={iconClassName}
				/>
			) : null}
			<span>{getPriorityLabel(priority)}</span>
		</span>
	);
}
