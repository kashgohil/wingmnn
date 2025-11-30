import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { TaskCreationDialog } from "@/components/projects/TaskCreationDialog";
import type { CalendarItem } from "@/lib/hooks/use-calendar-items";
import dayjs from "dayjs";

interface CalendarItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: CalendarItem | null;
	projectId: string;
	workflowId?: string | null;
	onItemUpdated?: () => void;
}

export function CalendarItemDialog({
	open,
	onOpenChange,
	item,
	projectId,
	workflowId,
	onItemUpdated,
}: CalendarItemDialogProps) {
	if (!item) return null;

	// For now, we'll just show a simple dialog
	// In the future, this could open the task/subtask edit dialog
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{item.title}</DialogTitle>
					<DialogDescription>
						{item.type} - {dayjs(item.date).format("MMMM D, YYYY")}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					{item.description && (
						<div>
							<p className="text-sm text-muted-foreground">
								{item.description}
							</p>
						</div>
					)}
					{item.durationMinutes && (
						<div>
							<p className="text-sm">
								Duration: {Math.floor(item.durationMinutes / 60)}h{" "}
								{item.durationMinutes % 60}m
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

