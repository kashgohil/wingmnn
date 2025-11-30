/**
 * Table Storage Utility
 *
 * Helper functions for managing table state in localStorage using LocalStorageManager.
 * Provides type-safe methods for storing and retrieving table configuration.
 */

import { localStorageManager } from "./local-storage-manager";
import type {
	ColumnFiltersState,
	ColumnOrderState,
	ColumnSizingState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";

export interface TableStorage {
	/**
	 * Retrieves sorting state from localStorage
	 */
	getSorting(): SortingState | null;

	/**
	 * Saves sorting state to localStorage
	 */
	setSorting(sorting: SortingState): void;

	/**
	 * Retrieves column filters state from localStorage
	 */
	getFilters(): ColumnFiltersState | null;

	/**
	 * Saves column filters state to localStorage
	 */
	setFilters(filters: ColumnFiltersState): void;

	/**
	 * Retrieves column sizing state from localStorage
	 */
	getSizing(): ColumnSizingState | null;

	/**
	 * Saves column sizing state to localStorage
	 */
	setSizing(sizing: ColumnSizingState): void;

	/**
	 * Retrieves column order state from localStorage
	 */
	getOrder(): ColumnOrderState | null;

	/**
	 * Saves column order state to localStorage
	 */
	setOrder(order: ColumnOrderState): void;

	/**
	 * Retrieves column visibility state from localStorage
	 */
	getVisibility(): VisibilityState | null;

	/**
	 * Saves column visibility state to localStorage
	 */
	setVisibility(visibility: VisibilityState): void;

	/**
	 * Clears all table state from localStorage
	 */
	clear(): void;
}

/**
 * Creates a TableStorage instance for a specific table
 * @param storageKey The base storage key for this table (e.g., "task-table-sort-123")
 * @returns A TableStorage instance with methods scoped to the provided key
 */
export function createTableStorage(storageKey: string): TableStorage {
	const getKey = (suffix: string) => `${storageKey}-${suffix}`;

	return {
		getSorting(): SortingState | null {
			const sorting = localStorageManager.getJSON<SortingState>(
				getKey("sorting"),
			);
			return sorting && Array.isArray(sorting) && sorting.length > 0
				? sorting
				: null;
		},

		setSorting(sorting: SortingState): void {
			localStorageManager.setJSON(getKey("sorting"), sorting);
		},

		getFilters(): ColumnFiltersState | null {
			const filters = localStorageManager.getJSON<ColumnFiltersState>(
				getKey("filters"),
			);
			return filters && Array.isArray(filters) && filters.length > 0
				? filters
				: null;
		},

		setFilters(filters: ColumnFiltersState): void {
			localStorageManager.setJSON(getKey("filters"), filters);
		},

		getSizing(): ColumnSizingState | null {
			const sizing = localStorageManager.getJSON<ColumnSizingState>(
				getKey("sizing"),
			);
			return sizing && typeof sizing === "object" ? sizing : null;
		},

		setSizing(sizing: ColumnSizingState): void {
			localStorageManager.setJSON(getKey("sizing"), sizing);
		},

		getOrder(): ColumnOrderState | null {
			const order = localStorageManager.getJSON<ColumnOrderState>(
				getKey("order"),
			);
			return order && Array.isArray(order) && order.length > 0 ? order : null;
		},

		setOrder(order: ColumnOrderState): void {
			localStorageManager.setJSON(getKey("order"), order);
		},

		getVisibility(): VisibilityState | null {
			const visibility = localStorageManager.getJSON<VisibilityState>(
				getKey("visibility"),
			);
			return visibility && typeof visibility === "object" ? visibility : null;
		},

		setVisibility(visibility: VisibilityState): void {
			localStorageManager.setJSON(getKey("visibility"), visibility);
		},

		clear(): void {
			localStorageManager.removeItem(getKey("sorting"));
			localStorageManager.removeItem(getKey("filters"));
			localStorageManager.removeItem(getKey("sizing"));
			localStorageManager.removeItem(getKey("order"));
			localStorageManager.removeItem(getKey("visibility"));
		},
	};
}

