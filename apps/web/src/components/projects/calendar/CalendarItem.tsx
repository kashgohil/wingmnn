import { Avatar } from "@/components/ui/avatar";
import { PriorityIcon } from "@/components/projects/PriorityLabel";
import type { CalendarItem as CalendarItemType } from "@/lib/hooks/use-calendar-items";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface CalendarItemProps {
	item: CalendarItemType;
	onClick?: (item: CalendarItemType) => void;
	statusColor?: string;
	compact?: boolean;
}

export function CalendarItem({
	item,
	onClick,
	statusColor,
	compact = false,
}: CalendarItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging,
	} = useDraggable({
		id: item.id,
		data: {
			type: item.type,
			item,
		},
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
	};

	const getItemColor = () => {
		if (statusColor) return statusColor;
		switch (item.type) {
			case "task":
				return "#3b82f6"; // blue
			case "subtask":
				return "#60a5fa"; // lighter blue
			case "timeEntry":
				return "#10b981"; // green
			case "milestone":
				return "#f59e0b"; // amber
			default:
				return "#6b7280"; // gray
		}
	};

	const borderColor = getItemColor();

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			onClick={() => onClick?.(item)}
			className={cn(
				"group cursor-pointer rounded-none border-2 bg-card/90 backdrop-blur-sm p-2 transition-all hover:bg-card hover:shadow-md",
				compact ? "text-xs" : "text-sm",
				isDragging && "z-50",
			)}
			style={{
				...style,
				borderColor,
				borderLeftWidth: "4px",
			}}
		>
			<div className="flex items-start gap-2">
				{!compact && item.priority && (
					<PriorityIcon
						priority={item.priority}
						className="mt-0.5 shrink-0"
					/>
				)}
				<div className="min-w-0 flex-1">
					<div
						className={cn(
							"font-medium truncate",
							compact ? "text-xs" : "text-sm",
						)}
					>
						{item.title}
					</div>
					{!compact && (
						<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
							{item.type === "timeEntry" && item.durationMinutes && (
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{Math.floor(item.durationMinutes / 60)}h{" "}
									{item.durationMinutes % 60}m
								</span>
							)}
							{item.assignedTo && (
								<Avatar
									name={item.assignedTo}
									size="sm"
									className="h-4 w-4 text-[10px]"
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

