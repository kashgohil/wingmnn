/**
 * Hook to fetch and aggregate calendar items for a project
 */

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Project } from "../api/projects.api";
import * as subtasksApi from "../api/subtasks.api";
import { useTasks } from "./use-tasks";
import { useTimeEntries } from "./use-time-entries";

export type CalendarItemType = "task" | "subtask" | "timeEntry" | "milestone";

export interface CalendarItem {
	id: string;
	type: CalendarItemType;
	title: string;
	date: Date; // Display date (dueDate or startDate)
	startDate?: Date;
	dueDate?: Date;
	priority?: "low" | "medium" | "high" | "critical";
	statusId?: string;
	assignedTo?: string | null;
	// Additional fields
	taskId?: string; // For subtasks
	projectId?: string;
	durationMinutes?: number; // For time entries
	description?: string | null;
	progress?: number | null;
}

export interface CalendarFilters {
	assignee?: string;
	priority?: "low" | "medium" | "high" | "critical";
	statusId?: string;
	itemTypes?: CalendarItemType[];
}

/**
 * Hook to fetch and aggregate calendar items for a project
 */
export function useCalendarItems(
	projectId: string | null,
	dateRange: { from: Date; to: Date },
	filters?: CalendarFilters,
) {
	// Fetch tasks for the project
	const { data: tasks = [], isLoading: tasksLoading } = useTasks({
		projectId: projectId ?? undefined,
		dueDateFrom: dateRange.from.toISOString(),
		dueDateTo: dateRange.to.toISOString(),
	});

	// Fetch all subtasks for all tasks using useQueries
	const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
	const subtaskQueries = useQueries({
		queries: taskIds.map((taskId) => ({
			queryKey: ["subtasks", taskId],
			queryFn: () => subtasksApi.listSubtasks(taskId),
			enabled: !!taskId,
			staleTime: 30 * 1000,
		})),
	});

	const allSubtasks = useMemo(() => {
		return subtaskQueries.flatMap((query) => query.data || []);
	}, [subtaskQueries]);

	// Fetch time entries for the date range
	const { data: timeEntries = [], isLoading: timeEntriesLoading } =
		useTimeEntries({
			dateFrom: dateRange.from.toISOString(),
			dateTo: dateRange.to.toISOString(),
		});

	// Aggregate calendar items
	const items = useMemo(() => {
		const calendarItems: CalendarItem[] = [];

		// Add tasks
		tasks.forEach((task) => {
			const displayDate = task.dueDate || task.startDate;
			if (displayDate) {
				calendarItems.push({
					id: task.id,
					type: "task",
					title: task.title,
					date: new Date(displayDate),
					startDate: task.startDate ? new Date(task.startDate) : undefined,
					dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
					priority: task.priority,
					statusId: task.statusId,
					assignedTo: task.assignedTo,
					projectId: task.projectId,
					description: task.description,
					progress: task.progress,
				});
			}
		});

		// Add subtasks
		allSubtasks.forEach((subtask) => {
			const displayDate = subtask.dueDate || subtask.startDate;
			if (displayDate) {
				calendarItems.push({
					id: subtask.id,
					type: "subtask",
					title: subtask.title,
					date: new Date(displayDate),
					startDate: subtask.startDate
						? new Date(subtask.startDate)
						: undefined,
					dueDate: subtask.dueDate ? new Date(subtask.dueDate) : undefined,
					priority: subtask.priority,
					statusId: subtask.statusId,
					assignedTo: subtask.assignedTo,
					taskId: subtask.taskId,
					description: subtask.description,
					progress: subtask.progress,
				});
			}
		});

		// Add time entries
		timeEntries.forEach((entry) => {
			calendarItems.push({
				id: entry.id,
				type: "timeEntry",
				title: entry.description || "Time entry",
				date: new Date(entry.date),
				assignedTo: entry.userId,
				durationMinutes: entry.durationMinutes,
				description: entry.description,
			});
		});

		// Apply filters
		let filteredItems = calendarItems;

		if (filters?.assignee) {
			filteredItems = filteredItems.filter(
				(item) => item.assignedTo === filters.assignee,
			);
		}

		if (filters?.priority) {
			filteredItems = filteredItems.filter(
				(item) => item.priority === filters.priority,
			);
		}

		if (filters?.statusId) {
			filteredItems = filteredItems.filter(
				(item) => item.statusId === filters.statusId,
			);
		}

		if (filters?.itemTypes && filters.itemTypes.length > 0) {
			filteredItems = filteredItems.filter((item) =>
				filters.itemTypes!.includes(item.type),
			);
		}

		return filteredItems;
	}, [tasks, allSubtasks, timeEntries, filters]);

	const isLoading =
		tasksLoading ||
		timeEntriesLoading ||
		subtaskQueries.some((q) => q.isLoading);

	return {
		items,
		isLoading,
	};
}

/**
 * Add project milestones to calendar items
 */
export function addProjectMilestones(
	items: CalendarItem[],
	project: Project | null,
): CalendarItem[] {
	if (!project) return items;

	const milestones: CalendarItem[] = [];

	if (project.startDate) {
		milestones.push({
			id: `milestone-start-${project.id}`,
			type: "milestone",
			title: `${project.name} - Start`,
			date: new Date(project.startDate),
			projectId: project.id,
		});
	}

	if (project.endDate) {
		milestones.push({
			id: `milestone-end-${project.id}`,
			type: "milestone",
			title: `${project.name} - End`,
			date: new Date(project.endDate),
			projectId: project.id,
		});
	}

	return [...items, ...milestones];
}
