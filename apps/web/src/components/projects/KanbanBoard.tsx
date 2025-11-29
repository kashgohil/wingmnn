import { TaskCard } from "@/components/projects/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/api/tasks.api";
import type { WorkflowStatus } from "@/lib/api/workflows.api";
import { useUpdateTaskStatus } from "@/lib/hooks/use-tasks";
import { toast } from "@/lib/toast";
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

interface KanbanBoardProps {
	tasks: Task[];
	statuses: WorkflowStatus[];
	statusMap: Map<string, { name: string; colorCode: string }>;
	isLoading?: boolean;
}

interface ColumnData {
	statusId: string;
	label: string;
	colorCode: string;
	tasks: Task[];
}

export function KanbanBoard({
	tasks,
	statuses,
	statusMap,
	isLoading = false,
}: KanbanBoardProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
		null,
	);
	const [initialDragX, setInitialDragX] = useState<number | null>(null);
	const { mutate: updateTaskStatus } = useUpdateTaskStatus();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	// Sort statuses by position and create columns
	const columns = useMemo<ColumnData[]>(() => {
		const sortedStatuses = [...statuses].sort(
			(a, b) => a.position - b.position,
		);

		// Create columns for each status
		const statusColumns = sortedStatuses.map((status) => ({
			statusId: status.id,
			label: status.name,
			colorCode: status.colorCode,
			tasks: tasks.filter((task) => task.statusId === status.id),
		}));

		// Add "Unassigned" column for tasks without a status
		const unassignedTasks = tasks.filter((task) => !task.statusId);
		if (unassignedTasks.length > 0) {
			statusColumns.push({
				statusId: "unassigned",
				label: "Unassigned",
				colorCode: "#808080",
				tasks: unassignedTasks,
			});
		}

		return statusColumns;
	}, [tasks, statuses]);

	const handleDragStart = (event: DragStartEvent) => {
		const taskId = event.active.id as string;
		setActiveId(taskId);
		const task = tasks.find((t) => t.id === taskId);
		setActiveTask(task || null);
		setDragDirection(null);

		// Store initial mouse X position
		if (event.activatorEvent && event.activatorEvent instanceof MouseEvent) {
			setInitialDragX(event.activatorEvent.clientX);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		// Determine drag direction based on mouse position relative to initial position
		if (
			event.activatorEvent &&
			event.activatorEvent instanceof MouseEvent &&
			initialDragX !== null
		) {
			const currentX = event.activatorEvent.clientX;
			const threshold = 10; // Minimum distance to determine direction

			if (currentX < initialDragX - threshold) {
				setDragDirection("left");
			} else if (currentX > initialDragX + threshold) {
				setDragDirection("right");
			}
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		// Reset drag direction and initial position
		setDragDirection(null);
		setInitialDragX(null);

		if (!over) {
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		const taskId = active.id as string;
		const overId = over.id as string;

		// Find the task being dragged
		const task = tasks.find((t) => t.id === taskId);
		if (!task) {
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		// Determine target status ID
		// If dropped on a column (status), use that status ID
		// If dropped on a task, use that task's status ID
		let targetStatusId: string | null = null;

		// Check if dropped on a column (status)
		const droppedOnColumn = columns.find((col) => col.statusId === overId);
		if (droppedOnColumn) {
			targetStatusId = droppedOnColumn.statusId;
		} else {
			// Check if dropped on another task
			const targetTask = tasks.find((t) => t.id === overId);
			if (targetTask) {
				targetStatusId = targetTask.statusId;
			}
		}

		if (!targetStatusId) {
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		// Don't update if dropped in the same column
		if (task.statusId === targetStatusId) {
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		// Validate that targetStatusId is a valid status (not "unassigned" unless it's actually unassigned)
		if (targetStatusId === "unassigned") {
			// For now, we'll skip unassigned drops or handle them differently
			// You might want to allow dropping to unassigned in the future
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		// Check if targetStatusId exists in the workflow
		const isValidStatus = statuses.some((s) => s.id === targetStatusId);
		if (!isValidStatus) {
			toast.error("Invalid status", {
				description: "Cannot move task to this status.",
			});
			setActiveId(null);
			setActiveTask(null);
			return;
		}

		// Clear overlay immediately - the optimistic update will show card in new column
		setActiveId(null);
		setActiveTask(null);

		// Update task status with optimistic update
		updateTaskStatus(
			{ id: taskId, statusId: targetStatusId },
			{
				onError: (error) => {
					toast.error("Failed to move task", {
						description:
							error instanceof Error
								? error.message
								: "Could not update task status.",
					});
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
				Loading board...
			</div>
		);
	}

	if (columns.length === 0) {
		if (tasks.length === 0) {
			return (
				<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-8 text-center text-muted-foreground">
					No tasks yet. Create tasks to populate the board.
				</div>
			);
		}
		return (
			<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-8 text-center text-muted-foreground">
				No statuses available. Please configure workflow statuses.
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="flex gap-4 overflow-x-auto pb-4 h-full">
				{columns.map((column) => (
					<KanbanColumn
						key={column.statusId}
						column={column}
						statusMap={statusMap}
						activeId={activeId}
					/>
				))}
			</div>
			<DragOverlay dropAnimation={null}>
				{activeTask ? (
					<div
						className="shadow-lg w-80"
						style={{
							transform:
								dragDirection === "left"
									? "rotate(-3deg)"
									: dragDirection === "right"
									? "rotate(3deg)"
									: "rotate(0deg)",
							transition: "transform 0.1s ease-out",
						}}
					>
						<TaskCard
							variant="kanban"
							task={activeTask}
							statusMap={statusMap}
						/>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

interface KanbanColumnProps {
	column: ColumnData;
	statusMap: Map<string, { name: string; colorCode: string }>;
	activeId: string | null;
}

function KanbanColumn({ column, statusMap, activeId }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.statusId,
	});

	const taskIds = column.tasks.map((task) => task.id);

	return (
		<div
			ref={setNodeRef}
			className={`shrink-0 w-80 ${isOver ? "ring-2 ring-primary/50" : ""}`}
		>
			<Card className="bg-muted/40 h-full flex flex-col overflow-hidden">
				<CardHeader className="pb-3 shrink-0">
					<CardTitle className="text-base font-semibold flex items-center gap-2">
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: column.colorCode }}
						/>
						{column.label}{" "}
						<span className="text-sm text-muted-foreground">
							({column.tasks.length})
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent
					className={`flex-1 overflow-y-auto overflow-x-hidden space-y-3 min-h-[200px] ${
						isOver ? "bg-primary/5" : ""
					}`}
				>
					<SortableContext
						items={taskIds}
						strategy={verticalListSortingStrategy}
					>
						{column.tasks.length === 0 ? (
							<div className="relative text-center text-sm text-muted-foreground py-8 border border-dashed border-border/50 rounded-none">
								Drop tasks here
								{isOver && taskIds.length === 0 && (
									<div className="absolute inset-0 h-full w-full bg-primary/20 rounded-none border border-dashed border-primary/50" />
								)}
							</div>
						) : (
							column.tasks.map((task) => (
								<KanbanTaskCard
									key={task.id}
									task={task}
									statusMap={statusMap}
									isDragging={activeId === task.id}
								/>
							))
						)}
					</SortableContext>
				</CardContent>
			</Card>
		</div>
	);
}

interface KanbanTaskCardProps {
	task: Task;
	statusMap: Map<string, { name: string; colorCode: string }>;
	isDragging: boolean;
}

function KanbanTaskCard({ task, statusMap, isDragging }: KanbanTaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: task.id,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="cursor-grab active:cursor-grabbing w-full"
		>
			<div className="relative w-full">
				{/* Use CSS to allow tooltips to work - tooltip triggers have higher z-index */}
				<div
					style={{
						position: "relative",
						// Allow pointer events on tooltip elements
					}}
					onPointerDown={(e) => {
						// Prevent drag from starting if clicking on tooltip elements
						const target = e.target as HTMLElement;
						const isTooltipElement =
							target.closest("[data-radix-tooltip-trigger]") !== null ||
							target.closest("[data-radix-tooltip-content]") !== null ||
							target.closest('[role="tooltip"]') !== null ||
							target.closest("button[aria-describedby]") !== null;

						if (isTooltipElement) {
							e.stopPropagation();
						}
					}}
				>
					<TaskCard
						variant="kanban"
						task={task}
						statusMap={statusMap}
					/>
				</div>
				<div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>
		</div>
	);
}
