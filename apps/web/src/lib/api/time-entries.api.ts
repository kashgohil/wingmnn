/**
 * Time Entries API Service
 *
 * Type-safe API calls for time entry-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface TimeEntry {
	id: string;
	userId: string;
	relatedEntityType: "task" | "subtask";
	relatedEntityId: string;
	durationMinutes: number;
	date: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListTimeEntriesParams {
	userId?: string;
	relatedEntityType?: "task" | "subtask";
	relatedEntityId?: string;
	dateFrom?: string;
	dateTo?: string;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
}

export interface CreateTimeEntryParams {
	relatedEntityType: "task" | "subtask";
	relatedEntityId: string;
	durationMinutes: number;
	date: string;
	description?: string;
}

export interface UpdateTimeEntryParams {
	durationMinutes?: number;
	date?: string;
	description?: string;
}

/**
 * List time entries with optional filters
 */
export async function listTimeEntries(params?: ListTimeEntriesParams) {
	const query: Record<string, string> = {};

	if (params?.userId) {
		query.userId = params.userId;
	}
	if (params?.relatedEntityType) {
		query.relatedEntityType = params.relatedEntityType;
	}
	if (params?.relatedEntityId) {
		query.relatedEntityId = params.relatedEntityId;
	}
	if (params?.dateFrom) {
		query.dateFrom = params.dateFrom;
	}
	if (params?.dateTo) {
		query.dateTo = params.dateTo;
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

	const [response, error] = await catchError(api["time-entries"].get({ query }));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch time entries",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch time entries",
		);
	}

	return (response?.data as { timeEntries?: TimeEntry[] })?.timeEntries || [];
}

/**
 * Get a single time entry by ID
 */
export async function getTimeEntry(id: string) {
	const [response, error] = await catchError(api["time-entries"]({ id }).get());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch time entry",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch time entry",
		);
	}

	return (response?.data as { timeEntry?: TimeEntry })?.timeEntry;
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(params: CreateTimeEntryParams) {
	const [response, error] = await catchError(
		api["time-entries"].post(params),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create time entry",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create time entry",
		);
	}

	return (response?.data as { timeEntry?: TimeEntry })?.timeEntry;
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(
	id: string,
	params: UpdateTimeEntryParams,
) {
	const [response, error] = await catchError(
		api["time-entries"]({ id }).put(params),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update time entry",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update time entry",
		);
	}

	return (response?.data as { timeEntry?: TimeEntry })?.timeEntry;
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(id: string) {
	const [response, error] = await catchError(
		api["time-entries"]({ id }).delete(),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete time entry",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to delete time entry",
		);
	}

	return response?.data;
}

