/**
 * React Query hooks for time entries
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateTimeEntryParams,
	ListTimeEntriesParams,
	TimeEntry,
	UpdateTimeEntryParams,
} from "../api/time-entries.api";
import * as timeEntriesApi from "../api/time-entries.api";

/**
 * Fetch time entries with filters
 */
export function useTimeEntries(params?: ListTimeEntriesParams) {
	return useQuery({
		queryKey: ["time-entries", params],
		queryFn: () => timeEntriesApi.listTimeEntries(params),
		staleTime: 30 * 1000,
	});
}

/**
 * Fetch a single time entry by ID
 */
export function useTimeEntry(id: string | null) {
	return useQuery({
		queryKey: ["time-entries", id],
		queryFn: () => {
			if (!id) throw new Error("Time entry ID is required");
			return timeEntriesApi.getTimeEntry(id);
		},
		enabled: !!id,
		staleTime: 30 * 1000,
	});
}

/**
 * Create a new time entry
 */
export function useCreateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateTimeEntryParams) =>
			timeEntriesApi.createTimeEntry(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
		},
	});
}

/**
 * Update a time entry
 */
export function useUpdateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: string;
			params: UpdateTimeEntryParams;
		}) => timeEntriesApi.updateTimeEntry(id, params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({
				queryKey: ["time-entries", variables.id],
			});
		},
	});
}

/**
 * Delete a time entry
 */
export function useDeleteTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => timeEntriesApi.deleteTimeEntry(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
		},
	});
}

