/**
 * Subtasks API Service
 *
 * Provides type-safe helpers for working with subtask endpoints.
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface Subtask {
	id: string;
	taskId: string;
	title: string;
	description: string | null;
	statusId: string;
	priority: "low" | "medium" | "high" | "critical";
	assignedTo: string | null;
	startDate: string | null;
	dueDate: string | null;
	progress: number | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateSubtaskParams {
	taskId: string;
	title: string;
	description?: string;
	statusId?: string;
	priority?: "low" | "medium" | "high" | "critical";
	assignedTo?: string;
	startDate?: string;
	dueDate?: string;
}

export interface UpdateSubtaskParams {
	title?: string;
	description?: string;
	priority?: "low" | "medium" | "high" | "critical";
	startDate?: string;
	dueDate?: string;
}

/**
 * List subtasks for a task
 */
export async function listSubtasks(taskId: string) {
	const [response, error] = await catchError(
		api.tasks({ id: taskId }).subtasks.get(),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch subtasks",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch subtasks",
		);
	}

	return (response?.data as { subtasks?: Subtask[] })?.subtasks || [];
}

/**
 * Create a new subtask under a parent task
 */
export async function createSubtask(params: CreateSubtaskParams) {
	const [response, error] = await catchError(api.subtasks.post(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create subtask",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create subtask",
		);
	}

	return (response?.data as { subtask?: Subtask })?.subtask;
}

/**
 * Update a subtask
 */
export async function updateSubtask(
	id: string,
	params: UpdateSubtaskParams,
) {
	const [response, error] = await catchError(api.subtasks({ id }).put(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update subtask",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update subtask",
		);
	}

	return (response?.data as { subtask?: Subtask })?.subtask;
}
