import type { Project } from "@/lib/api/projects.api";
import type { WorkflowStatus } from "@/lib/api/workflows.api";
import {
	addProjectMilestones,
	CalendarFilters,
	useCalendarItems,
	type CalendarItem,
} from "@/lib/hooks/use-calendar-items";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { CalendarDndContext } from "./calendar/CalendarDndContext";
import { CalendarItemDialog } from "./calendar/CalendarItemDialog";
import { CalendarToolbar, type CalendarView } from "./calendar/CalendarToolbar";
import { DayView } from "./calendar/DayView";
import { MonthView } from "./calendar/MonthView";
import { WeekView } from "./calendar/WeekView";
import { useProjectsDialogs } from "./useProjectsDialogs";

interface ProjectCalendarProps {
	project: Project | null;
	workflow?: { statuses: WorkflowStatus[] } | null;
	projectId: string;
}

export function ProjectCalendar({
	project,
	workflow,
	projectId,
}: ProjectCalendarProps) {
	const [view, setView] = useState<CalendarView>("month");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
	const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
	const { openTaskCreation } = useProjectsDialogs();

	// Calculate date range based on view
	const dateRange = useMemo(() => {
		if (view === "month") {
			const start = dayjs(currentDate).startOf("month").subtract(7, "days");
			const end = dayjs(currentDate).endOf("month").add(7, "days");
			return { from: start.toDate(), to: end.toDate() };
		} else if (view === "week") {
			const start = dayjs(currentDate).startOf("week");
			const end = dayjs(currentDate).endOf("week");
			return { from: start.toDate(), to: end.toDate() };
		} else {
			const start = dayjs(currentDate).startOf("day");
			const end = dayjs(currentDate).endOf("day");
			return { from: start.toDate(), to: end.toDate() };
		}
	}, [view, currentDate]);

	// Filters
	const [filters, setFilters] = useState<CalendarFilters>({});

	const handleFilterChange = (newFilters: CalendarFilters | undefined) => {
		setFilters(newFilters || {});
	};

	// Fetch calendar items
	const { items: rawItems, isLoading } = useCalendarItems(
		projectId,
		dateRange,
		filters,
	);

	// Add project milestones
	const items = useMemo(() => {
		return addProjectMilestones(rawItems, project);
	}, [rawItems, project]);

	// Status map
	const statusMap = useMemo(() => {
		const map = new Map<string, { name: string; colorCode: string }>();
		if (workflow?.statuses) {
			workflow.statuses.forEach((status) => {
				map.set(status.id, {
					name: status.name,
					colorCode: status.colorCode,
				});
			});
		}
		return map;
	}, [workflow]);

	// Extract unique assignees and statuses for filters
	const assignees = useMemo(() => {
		const assigneeSet = new Set<string>();
		items.forEach((item) => {
			if (item.assignedTo) {
				assigneeSet.add(item.assignedTo);
			}
		});
		// In a real app, you'd fetch user details
		return Array.from(assigneeSet).map((id) => ({ id, name: id }));
	}, [items]);

	const statuses = useMemo(() => {
		return workflow?.statuses || [];
	}, [workflow]);

	const handleItemClick = (item: CalendarItem) => {
		setSelectedItem(item);
		setIsItemDialogOpen(true);
	};

	const handleCreateItem = (_date?: Date) => {
		openTaskCreation({
			projectId,
			projectName: project?.name ?? undefined,
			workflowId: project?.workflowId ?? null,
		});
	};

	const handleDateClick = (date: Date) => {
		setCurrentDate(date);
		if (view === "month") {
			setView("day");
		}
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	return (
		<CalendarDndContext>
			<div className="flex h-full flex-col retro-border">
				<CalendarToolbar
					view={view}
					onViewChange={setView}
					currentDate={currentDate}
					onDateChange={setCurrentDate}
					onToday={handleToday}
					onCreateItem={handleCreateItem}
					filters={filters}
					onFilterChange={handleFilterChange}
					assignees={assignees}
					statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
				/>

				{isLoading ? (
					<div className="flex h-full items-center justify-center">
						<div className="text-muted-foreground">Loading calendar...</div>
					</div>
				) : (
					<div className="flex-1 overflow-hidden rounded-none bg-card/70">
						{view === "month" && (
							<MonthView
								items={items}
								currentDate={currentDate}
								onItemClick={handleItemClick}
								onDateClick={handleDateClick}
								statusMap={statusMap}
							/>
						)}
						{view === "week" && (
							<WeekView
								items={items}
								currentDate={currentDate}
								onItemClick={handleItemClick}
								onDateClick={handleDateClick}
								statusMap={statusMap}
							/>
						)}
						{view === "day" && (
							<DayView
								items={items}
								currentDate={currentDate}
								onItemClick={handleItemClick}
								statusMap={statusMap}
							/>
						)}
					</div>
				)}

				<CalendarItemDialog
					open={isItemDialogOpen}
					onOpenChange={setIsItemDialogOpen}
					item={selectedItem}
					projectId={projectId}
					workflowId={project?.workflowId ?? null}
				/>
			</div>
		</CalendarDndContext>
	);
}
