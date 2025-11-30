/**
 * Table Storage Utility
 *
 * Zustand store for managing table state with localStorage persistence.
 * Provides type-safe methods for storing and retrieving table configuration.
 */

import type {
	ColumnFiltersState,
	ColumnOrderState,
	ColumnSizingState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TableState {
	sorting: SortingState;
	filters: ColumnFiltersState;
	sizing: ColumnSizingState;
	order: ColumnOrderState;
	visibility: VisibilityState;
	setSorting: (sorting: SortingState) => void;
	setFilters: (filters: ColumnFiltersState) => void;
	setSizing: (sizing: ColumnSizingState) => void;
	setOrder: (order: ColumnOrderState) => void;
	setVisibility: (visibility: VisibilityState) => void;
	clear: () => void;
}

/**
 * Creates a Zustand store for a specific table with localStorage persistence
 * @param storageKey The base storage key for this table (e.g., "task-table-sort-123")
 * @returns A Zustand store instance
 */
export function createTableStore(storageKey: string) {
	return create<TableState>()(
		persist(
			(set) => ({
				sorting: [],
				filters: [],
				sizing: {},
				order: [],
				visibility: {},
				setSorting: (sorting) => set({ sorting }),
				setFilters: (filters) => set({ filters }),
				setSizing: (sizing) => set({ sizing }),
				setOrder: (order) => set({ order }),
				setVisibility: (visibility) => set({ visibility }),
				clear: () =>
					set({
						sorting: [],
						filters: [],
						sizing: {},
						order: [],
						visibility: {},
					}),
			}),
			{
				name: storageKey,
				storage: createJSONStorage(() => localStorage),
			},
		),
	);
}

export type TableStore = ReturnType<typeof createTableStore>;
