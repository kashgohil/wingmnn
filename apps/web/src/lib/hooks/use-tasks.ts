/**
 * React Query hooks for tasks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "../auth/auth-context";
import * as tasksApi from "../api/tasks.api";
import type { CreateTaskParams, ListTasksParams, UpdateTaskParams } from "../api/tasks.api";

/**
 * Fetch tasks assigned to the current user
 */
export function useMyTasks(params?: Omit<ListTasksParams, "assignedTo">) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["tasks", "my-tasks", user?.id, params],
		queryFn: () => {
			if (!user?.id) throw new Error("User not authenticated");
			return tasksApi.listTasks({ ...params, assignedTo: user.id });
		},
		enabled: !!user?.id,
		staleTime: 30 * 1000, // 30 seconds
	});
}

/**
 * Fetch tasks with filters
 */
export function useTasks(params?: ListTasksParams) {
	return useQuery({
		queryKey: ["tasks", params],
		queryFn: () => tasksApi.listTasks(params),
		staleTime: 30 * 1000,
	});
}

/**
 * Fetch a single task by ID
 */
export function useTask(id: string | null) {
	return useQuery({
		queryKey: ["tasks", id],
		queryFn: () => {
			if (!id) throw new Error("Task ID is required");
			return tasksApi.getTask(id);
		},
		enabled: !!id,
		staleTime: 30 * 1000,
	});
}

/**
 * Calculate task statistics from task list
 */
export function useTaskStats() {
	const { user } = useAuth();
	const { data: tasks = [], isLoading } = useMyTasks();

	const stats = React.useMemo(() => {
		if (!tasks.length) {
			return {
				total: 0,
				byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
				byStatus: {} as Record<string, number>,
				overdue: 0,
				upcoming: 0,
				completed: 0,
			};
		}

		const now = new Date();
		const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };
		const byStatus: Record<string, number> = {};
		let overdue = 0;
		let upcoming = 0;
		let completed = 0;

		tasks.forEach((task) => {
			// Count by priority
			byPriority[task.priority]++;

			// Count by status
			byStatus[task.statusId] = (byStatus[task.statusId] || 0) + 1;

			// Check overdue
			if (task.dueDate) {
				const dueDate = new Date(task.dueDate);
				if (dueDate < now) {
					overdue++;
				} else if (dueDate <= sevenDaysFromNow) {
					upcoming++;
				}
			}

			// Check completed (assuming closed phase means completed)
			// This will need to be enhanced when we have workflow status data
		});

		return {
			total: tasks.length,
			byPriority,
			byStatus,
			overdue,
			upcoming,
			completed,
		};
	}, [tasks]);

	return { data: stats, isLoading };
}

/**
 * Create a new task
 */
export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateTaskParams) => tasksApi.createTask(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}

/**
 * Update a task
 */
export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, params }: { id: string; params: UpdateTaskParams }) =>
			tasksApi.updateTask(id, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
		},
	});
}

/**
 * Delete a task
 */
export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tasksApi.deleteTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}

/**
 * Update task status
 */
export function useUpdateTaskStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
			tasksApi.updateTaskStatus(id, statusId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}

