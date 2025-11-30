/**
 * Table Column Store
 *
 * Zustand store for managing table column configuration state with real-time updates.
 * This ensures the column configuration popover updates immediately when changes occur.
 */

import { create } from "zustand";
import type { ColumnOrderState, VisibilityState } from "@tanstack/react-table";

export interface TableColumnState {
	columnOrder: ColumnOrderState;
	columnVisibility: VisibilityState;
	setColumnOrder: (order: ColumnOrderState) => void;
	setColumnVisibility: (visibility: VisibilityState) => void;
	toggleColumnVisibility: (columnId: string, visible: boolean) => void;
	updateColumnOrder: (columnId: string, direction: "up" | "down") => void;
}

/**
 * Creates a Zustand store for a specific table's column configuration
 * @param storageKey The storage key for this table (e.g., "task-table-sort-123")
 * @returns A Zustand store instance
 */
export function createTableColumnStore(storageKey: string) {
	return create<TableColumnState>((set) => ({
		columnOrder: [],
		columnVisibility: {},
		setColumnOrder: (order) => set({ columnOrder: order }),
		setColumnVisibility: (visibility) => set({ columnVisibility: visibility }),
		toggleColumnVisibility: (columnId, visible) =>
			set((state) => ({
				columnVisibility: {
					...state.columnVisibility,
					[columnId]: visible ? undefined : false,
				},
			})),
		updateColumnOrder: (columnId, direction) =>
			set((state) => {
				const currentOrder = [...state.columnOrder];
				const index = currentOrder.indexOf(columnId);
				if (index === -1) return state;

				const newIndex = direction === "up" ? index - 1 : index + 1;
				if (newIndex < 0 || newIndex >= currentOrder.length) return state;

				const newOrder = [...currentOrder];
				[newOrder[index], newOrder[newIndex]] = [
					newOrder[newIndex],
					newOrder[index],
				];

				return { columnOrder: newOrder };
			}),
	}));
}

