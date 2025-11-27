/**
 * React Query hooks for tags
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addTagToTask,
	createTag,
	listProjectTags,
	type CreateTagParams,
} from "../api/tags.api";

/**
 * Fetch tags for a project
 */
export function useProjectTags(projectId: string | null) {
	return useQuery({
		queryKey: ["tags", "project", projectId],
		queryFn: () => {
			if (!projectId) throw new Error("Project ID is required");
			return listProjectTags(projectId);
		},
		enabled: !!projectId,
		staleTime: 30 * 1000, // 30 seconds
	});
}

/**
 * Create a new tag
 */
export function useCreateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			projectId,
			params,
		}: {
			projectId: string;
			params: CreateTagParams;
		}) => createTag(projectId, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["tags", "project", variables.projectId],
			});
		},
	});
}

/**
 * Add a tag to a task
 */
export function useAddTagToTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
			addTagToTask(taskId, tagId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}
