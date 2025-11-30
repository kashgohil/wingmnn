/**
 * React Query hooks for subtasks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as subtasksApi from "../api/subtasks.api";

/**
 * Fetch subtasks for a task
 */
export function useSubtasks(taskId: string | null) {
	return useQuery({
		queryKey: ["subtasks", taskId],
		queryFn: () => {
			if (!taskId) throw new Error("Task ID is required");
			return subtasksApi.listSubtasks(taskId);
		},
		enabled: !!taskId,
		staleTime: 30 * 1000,
	});
}

/**
 * Create a new subtask
 */
export function useCreateSubtask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: subtasksApi.CreateSubtaskParams) =>
			subtasksApi.createSubtask(params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["subtasks", variables.taskId],
			});
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}

/**
 * Update a subtask
 */
export function useUpdateSubtask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: string;
			params: subtasksApi.UpdateSubtaskParams;
		}) => subtasksApi.updateSubtask(id, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["subtasks"] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}
