/**
 * Tasks API Service
 *
 * Type-safe API calls for task-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface Task {
	id: string;
	projectId: string;
	taskNumber: number;
	title: string;
	description: string | null;
	statusId: string;
	priority: "low" | "medium" | "high" | "critical";
	assignedTo: string | null;
	startDate: string | null;
	dueDate: string | null;
	estimatedHours: number | null;
	estimatedPoints: number | null;
	progress: number | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListTasksParams {
	projectId?: string;
	statusId?: string;
	assignedTo?: string;
	priority?: "low" | "medium" | "high" | "critical";
	startDateFrom?: string;
	startDateTo?: string;
	dueDateFrom?: string;
	dueDateTo?: string;
	includeDeleted?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
}

export interface CreateTaskParams {
	projectId: string;
	title: string;
	description?: string;
	statusId?: string;
	priority?: "low" | "medium" | "high" | "critical";
	assignedTo?: string;
	startDate?: string;
	dueDate?: string;
	estimatedHours?: number;
	estimatedPoints?: number;
}

export interface UpdateTaskParams {
	title?: string;
	description?: string;
	priority?: "low" | "medium" | "high" | "critical";
	startDate?: string;
	dueDate?: string;
	estimatedHours?: number;
	estimatedPoints?: number;
}

/**
 * List tasks with optional filters
 */
export async function listTasks(params?: ListTasksParams) {
	const query: Record<string, string> = {};

	if (params?.projectId) {
		query.projectId = params.projectId;
	}
	if (params?.statusId) {
		query.statusId = params.statusId;
	}
	if (params?.assignedTo) {
		query.assignedTo = params.assignedTo;
	}
	if (params?.priority) {
		query.priority = params.priority;
	}
	if (params?.startDateFrom) {
		query.startDateFrom = params.startDateFrom;
	}
	if (params?.startDateTo) {
		query.startDateTo = params.startDateTo;
	}
	if (params?.dueDateFrom) {
		query.dueDateFrom = params.dueDateFrom;
	}
	if (params?.dueDateTo) {
		query.dueDateTo = params.dueDateTo;
	}
	if (params?.includeDeleted !== undefined) {
		query.includeDeleted = params.includeDeleted.toString();
	}
	if (params?.limit !== undefined) {
		query.limit = params.limit.toString();
	}
	if (params?.offset !== undefined) {
		query.offset = params.offset.toString();
	}
	if (params?.sortBy) {
		query.sortBy = params.sortBy;
	}
	if (params?.sortDirection) {
		query.sortDirection = params.sortDirection;
	}

	const [response, error] = await catchError(api.tasks.get(query));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch tasks",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch tasks",
		);
	}

	return (response?.data as { tasks?: Task[] })?.tasks || [];
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string) {
	const [response, error] = await catchError(api.tasks({ id }).get());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch task",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch task",
		);
	}

	return (response?.data as { task?: Task })?.task;
}

/**
 * Create a new task
 */
export async function createTask(params: CreateTaskParams) {
	const [response, error] = await catchError(api.tasks.post(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create task",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create task",
		);
	}

	return (response?.data as { task?: Task })?.task;
}

/**
 * Update a task
 */
export async function updateTask(id: string, params: UpdateTaskParams) {
	const [response, error] = await catchError(api.tasks({ id }).put(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update task",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update task",
		);
	}

	return (response?.data as { task?: Task })?.task;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string) {
	const [response, error] = await catchError(api.tasks({ id }).delete());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete task",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to delete task",
		);
	}

	return response?.data;
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string, statusId: string) {
	const [response, error] = await catchError(
		api.tasks({ id }).status.patch({ statusId }),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update task status",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update task status",
		);
	}

	return (response?.data as { task?: Task })?.task;
}
