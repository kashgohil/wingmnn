/**
 * React Query hooks for subtasks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as subtasksApi from "../api/subtasks.api";

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
