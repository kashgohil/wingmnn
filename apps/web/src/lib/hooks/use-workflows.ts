/**
 * React Query hooks for workflows
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as workflowsApi from "../api/workflows.api";
import type {
	CreateStatusParams,
	CreateWorkflowParams,
	ListWorkflowsParams,
	UpdateStatusParams,
} from "../api/workflows.api";

/**
 * Fetch workflows
 */
export function useWorkflows(params?: ListWorkflowsParams) {
	return useQuery({
		queryKey: ["workflows", params],
		queryFn: () => workflowsApi.listWorkflows(params),
		staleTime: 60 * 1000, // 1 minute
	});
}

/**
 * Fetch a single workflow by ID with all statuses
 */
export function useWorkflow(id: string | null) {
	return useQuery({
		queryKey: ["workflows", id],
		queryFn: () => {
			if (!id) throw new Error("Workflow ID is required");
			return workflowsApi.getWorkflow(id);
		},
		enabled: !!id,
		staleTime: 60 * 1000,
	});
}

/**
 * Create a new workflow
 */
export function useCreateWorkflow() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateWorkflowParams) => workflowsApi.createWorkflow(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
		},
	});
}

/**
 * Delete a workflow
 */
export function useDeleteWorkflow() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workflowsApi.deleteWorkflow(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
		},
	});
}

/**
 * Add a status to a workflow
 */
export function useCreateStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workflowId, params }: { workflowId: string; params: CreateStatusParams }) =>
			workflowsApi.createStatus(workflowId, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
			queryClient.invalidateQueries({ queryKey: ["workflows", variables.workflowId] });
		},
	});
}

/**
 * Update a workflow status
 */
export function useUpdateStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workflowId,
			statusId,
			params,
		}: {
			workflowId: string;
			statusId: string;
			params: UpdateStatusParams;
		}) => workflowsApi.updateStatus(workflowId, statusId, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
			queryClient.invalidateQueries({ queryKey: ["workflows", variables.workflowId] });
		},
	});
}

/**
 * Delete a workflow status
 */
export function useDeleteStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workflowId, statusId }: { workflowId: string; statusId: string }) =>
			workflowsApi.deleteStatus(workflowId, statusId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
			queryClient.invalidateQueries({ queryKey: ["workflows", variables.workflowId] });
		},
	});
}

/**
 * Reorder statuses in a workflow
 */
export function useReorderStatuses() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workflowId, statusIds }: { workflowId: string; statusIds: string[] }) =>
			workflowsApi.reorderStatuses(workflowId, statusIds),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["workflows"] });
			queryClient.invalidateQueries({ queryKey: ["workflows", variables.workflowId] });
		},
	});
}

