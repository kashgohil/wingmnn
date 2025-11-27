/**
 * Tags API Service
 *
 * Type-safe API calls for tag-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface Tag {
	id: string;
	name: string;
	description: string | null;
	colorCode: string;
	projectId: string;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * List tags for a project
 */
export async function listProjectTags(projectId: string) {
	const [response, error] = await catchError(
		api.projects({ id: projectId }).tags.get(),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch tags",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch tags",
		);
	}

	return (response?.data as { tags?: Tag[] })?.tags || [];
}

/**
 * Create a new tag
 */
export interface CreateTagParams {
	name: string;
	description?: string;
	colorCode?: string;
}

export async function createTag(projectId: string, params: CreateTagParams) {
	const [response, error] = await catchError(
		api.projects({ id: projectId }).tags.post(params),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create tag",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create tag",
		);
	}

	return (response?.data as { tag?: Tag })?.tag;
}

/**
 * Add a tag to a task
 */
export async function addTagToTask(taskId: string, tagId: string) {
	const [response, error] = await catchError(
		api.tasks({ id: taskId }).tags.post({ tagId }),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to add tag to task",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to add tag to task",
		);
	}

	return response?.data;
}
