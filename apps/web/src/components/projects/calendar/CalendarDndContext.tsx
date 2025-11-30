import type { CalendarItem } from "@/lib/hooks/use-calendar-items";
import { useUpdateSubtask } from "@/lib/hooks/use-subtasks";
import { useUpdateTask } from "@/lib/hooks/use-tasks";
import { useUpdateTimeEntry } from "@/lib/hooks/use-time-entries";
import { toast } from "@/lib/toast";
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import dayjs from "dayjs";
import { useState } from "react";

interface CalendarDndContextProps {
	children: React.ReactNode;
	onItemUpdate?: (item: CalendarItem, newDate: Date) => void;
}

export function CalendarDndContext({
	children,
	onItemUpdate,
}: CalendarDndContextProps) {
	const [activeItem, setActiveItem] = useState<CalendarItem | null>(null);
	const { mutate: updateTask } = useUpdateTask();
	const { mutate: updateSubtask } = useUpdateSubtask();
	const { mutate: updateTimeEntry } = useUpdateTimeEntry();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current as
			| { item: CalendarItem }
			| undefined;
		if (data?.item) {
			setActiveItem(data.item);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveItem(null);

		const data = event.active.data.current as
			| { item: CalendarItem }
			| undefined;
		if (!data?.item) {
			return;
		}

		const { item } = data;
		const over = event.over;

		if (!over || !over.data.current) {
			return;
		}

		// Extract date from drop target
		const targetDate = over.data.current.date as Date | undefined;
		if (!targetDate) {
			return;
		}

		const newDate = dayjs(targetDate).toDate();

		// Update based on item type
		if (item.type === "task") {
			updateTask(
				{
					id: item.id,
					params: {
						dueDate: dayjs(newDate).format("YYYY-MM-DD"),
					},
				},
				{
					onSuccess: () => {
						toast.success("Task date updated");
						onItemUpdate?.(item, newDate);
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update task date",
						);
					},
				},
			);
		} else if (item.type === "subtask") {
			updateSubtask(
				{
					id: item.id,
					params: {
						dueDate: dayjs(newDate).format("YYYY-MM-DD"),
					},
				},
				{
					onSuccess: () => {
						toast.success("Subtask date updated");
						onItemUpdate?.(item, newDate);
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update subtask date",
						);
					},
				},
			);
		} else if (item.type === "timeEntry") {
			updateTimeEntry(
				{
					id: item.id,
					params: {
						date: dayjs(newDate).format("YYYY-MM-DD"),
					},
				},
				{
					onSuccess: () => {
						toast.success("Time entry date updated");
						onItemUpdate?.(item, newDate);
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update time entry date",
						);
					},
				},
			);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			{children}
			<DragOverlay>
				{activeItem && (
					<div className="rounded-none border-2 border-primary bg-card p-2 shadow-lg">
						<div className="text-sm font-medium">{activeItem.title}</div>
					</div>
				)}
			</DragOverlay>
		</DndContext>
	);
}
