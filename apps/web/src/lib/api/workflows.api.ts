/**
 * Workflows API Service
 * 
 * Type-safe API calls for workflow-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface WorkflowStatus {
	id: string;
	workflowId: string;
	name: string;
	description: string | null;
	phase: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
	colorCode: string;
	position: number;
	createdAt: string;
	updatedAt: string;
}

export interface Workflow {
	id: string;
	name: string;
	description: string | null;
	workflowType: "task" | "subtask";
	createdBy: string;
	isTemplate: boolean;
	createdAt: string;
	updatedAt: string;
	statuses?: WorkflowStatus[];
}

export interface ListWorkflowsParams {
	type?: "task" | "subtask";
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
}

export interface CreateWorkflowParams {
	name: string;
	description?: string;
	workflowType: "task" | "subtask";
	isTemplate?: boolean;
}

export interface UpdateWorkflowParams {
	name?: string;
	description?: string;
}

export interface CreateStatusParams {
	name: string;
	description?: string;
	phase: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
	colorCode?: string;
	position?: number;
}

export interface UpdateStatusParams {
	name?: string;
	description?: string;
	phase?: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
	colorCode?: string;
	position?: number;
}

/**
 * List all workflows accessible to the authenticated user
 */
export async function listWorkflows(params?: ListWorkflowsParams) {
	const query: Record<string, string> = {};
	
	if (params?.type) {
		query.type = params.type;
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

	const [response, error] = await catchError(
		api.workflows.get(query)
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to fetch workflows");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch workflows"
		);
	}

	return (response?.data as { workflows?: Workflow[] })?.workflows || [];
}

/**
 * Get a single workflow by ID with all statuses
 */
export async function getWorkflow(id: string) {
	const [response, error] = await catchError(
		api.workflows({ id }).get()
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to fetch workflow");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch workflow"
		);
	}

	return (response?.data as { workflow?: Workflow })?.workflow;
}

/**
 * Create a new workflow
 */
export async function createWorkflow(params: CreateWorkflowParams) {
	const [response, error] = await catchError(
		api.workflows.post(params)
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to create workflow");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create workflow"
		);
	}

	return (response?.data as { workflow?: Workflow })?.workflow;
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string) {
	const [response, error] = await catchError(
		api.workflows({ id }).delete()
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to delete workflow");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to delete workflow"
		);
	}

	return response?.data;
}

/**
 * Add a status to a workflow
 */
export async function createStatus(workflowId: string, params: CreateStatusParams) {
	const [response, error] = await catchError(
		api.workflows({ id: workflowId }).statuses.post(params)
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to create status");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to create status"
		);
	}

	return (response?.data as { status?: WorkflowStatus })?.status;
}

/**
 * Update a workflow status
 */
export async function updateStatus(workflowId: string, statusId: string, params: UpdateStatusParams) {
	const [response, error] = await catchError(
		api.workflows({ id: workflowId }).statuses({ statusId }).put(params)
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to update status");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to update status"
		);
	}

	return (response?.data as { status?: WorkflowStatus })?.status;
}

/**
 * Delete a workflow status
 */
export async function deleteStatus(workflowId: string, statusId: string) {
	const [response, error] = await catchError(
		api.workflows({ id: workflowId }).statuses({ statusId }).delete()
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to delete status");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to delete status"
		);
	}

	return response?.data;
}

/**
 * Reorder statuses in a workflow
 */
export async function reorderStatuses(workflowId: string, statusIds: string[]) {
	const [response, error] = await catchError(
		api.workflows({ id: workflowId }).statuses.reorder.patch({ statusIds })
	);

	if (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to reorder statuses");
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to reorder statuses"
		);
	}

	return response?.data;
}

