/**
 * Projects API Service
 *
 * Type-safe API calls for project-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface ProjectSettings {
	enableTimeTracking?: boolean;
	enableNotifications?: boolean;
	selectedView?: string;
}

export interface Project {
	id: string;
	name: string;
	description: string | null;
	ownerId: string;
	workflowId: string;
	status: "active" | "archived" | "on_hold" | "completed";
	statusUpdatedAt: string | null;
	key: string | null;
	startDate: string | null;
	endDate: string | null;
	priority: "low" | "medium" | "high" | "critical" | null;
	category: string | null;
	settings: ProjectSettings | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListProjectsParams {
	status?: "active" | "archived" | "on_hold" | "completed" | "all";
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
}

export interface CreateProjectParams {
	name: string;
	description?: string;
	workflowId: string;
	status?: "active" | "archived" | "on_hold" | "completed";
	key?: string;
	startDate?: string;
	endDate?: string;
	priority?: "low" | "medium" | "high" | "critical";
	category?: string;
	settings?: ProjectSettings;
}

export interface UpdateProjectParams {
	name?: string;
	description?: string | null;
	key?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	priority?: "low" | "medium" | "high" | "critical" | null;
	category?: string | null;
	settings?: ProjectSettings;
}

/**
 * List all projects accessible to the authenticated user
 */
export async function listProjects(params?: ListProjectsParams) {
	const query: Record<string, string> = {};

	if (params?.status) {
		query.status = params.status;
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

	const [response, error] = await catchError(api.projects.get(query));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch projects",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch projects",
		);
	}

	return (response?.data as { projects?: Project[] })?.projects || [];
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string) {
	const [response, error] = await catchError(api.projects({ id }).get());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch project",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch project",
		);
	}

	return (response?.data as { project?: Project })?.project;
}

/**
 * Create a new project
 */
export async function createProject(params: CreateProjectParams) {
	const [response, error] = await catchError(api.projects.post(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create project",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create project",
		);
	}

	return (response?.data as { project?: Project })?.project;
}

/**
 * Update a project
 */
export async function updateProject(id: string, params: UpdateProjectParams) {
	const [response, error] = await catchError(api.projects({ id }).put(params));

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update project",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update project",
		);
	}

	return (response?.data as { project?: Project })?.project;
}

/**
 * Update project status
 */
export async function updateProjectStatus(
	id: string,
	status: Project["status"],
) {
	const [response, error] = await catchError(
		api.projects({ id }).status.patch({ status }),
	);

	if (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to update project status",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update project status",
		);
	}

	return (response?.data as { project?: Project })?.project;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
	const [response, error] = await catchError(api.projects({ id }).delete());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete project",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to delete project",
		);
	}

	return response?.data;
}

export interface AddProjectMemberParams {
	userId?: string;
	userGroupId?: string;
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
	projectId: string,
	params: AddProjectMemberParams,
) {
	const [response, error] = await catchError(
		api.projects({ id: projectId }).members.post(params),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to add project member",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to add project member",
		);
	}

	return response?.data;
}

export interface AddProjectMembersBulkParams {
	userId?: string;
	userGroupId?: string;
}

/**
 * Add multiple members to a project in a single request
 */
export async function addProjectMembersBulk(
	projectId: string,
	members: AddProjectMembersBulkParams[],
) {
	const [response, error] = await catchError(
		api.projects({ id: projectId }).members.bulk.post({ members }),
	);

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to add project members",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to add project members",
		);
	}

	return response?.data;
}

export interface ProjectMember {
	id: string;
	projectId: string;
	userId: string | null;
	userGroupId: string | null;
	addedBy: string;
	addedAt: string;
}

/**
 * List members of a project
 */
export async function listProjectMembers(projectId: string) {
	const [response, error] = await catchError(
		api.projects({ id: projectId }).members.get(),
	);

	if (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch project members",
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch project members",
		);
	}

	return (response?.data as { members?: ProjectMember[] })?.members || [];
}
