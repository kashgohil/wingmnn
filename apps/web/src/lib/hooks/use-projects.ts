/**
 * React Query hooks for projects
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateProjectParams,
	ListProjectsParams,
	Project,
	UpdateProjectParams,
} from "../api/projects.api";
import * as projectsApi from "../api/projects.api";

/**
 * Fetch user's projects
 */
export function useProjects(params?: ListProjectsParams) {
	return useQuery({
		queryKey: ["projects", params],
		queryFn: () => projectsApi.listProjects(params),
		staleTime: 30 * 1000, // 30 seconds
	});
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string | null) {
	return useQuery({
		queryKey: ["projects", id],
		queryFn: () => {
			if (!id) throw new Error("Project ID is required");
			return projectsApi.getProject(id);
		},
		enabled: !!id,
		staleTime: 30 * 1000,
	});
}

/**
 * Create a new project
 */
export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateProjectParams) =>
			projectsApi.createProject(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

/**
 * Update a project
 */
export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, params }: { id: string; params: UpdateProjectParams }) =>
			projectsApi.updateProject(id, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
		},
	});
}

/**
 * Update a project's status
 */
export function useUpdateProjectStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: Project["status"] }) =>
			projectsApi.updateProjectStatus(id, status),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
		},
	});
}

/**
 * Delete a project
 */
export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => projectsApi.deleteProject(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
