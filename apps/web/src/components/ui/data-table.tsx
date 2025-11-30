/**
 * DataTable Component
 * A reusable table component built on TanStack Table
 * Supports sorting, column resizing, column visibility, and sticky columns
 */

import { cn } from "@/lib/utils";
import {
	type ColumnDef,
	type ColumnSizingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "./skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	/**
	 * Storage key for persisting sorting state in localStorage
	 * If not provided, sorting state is not persisted
	 */
	storageKey?: string;
	/**
	 * Initial sorting state
	 */
	initialSorting?: SortingState;
	/**
	 * Column IDs that should be sortable
	 * If not provided, all columns are sortable
	 */
	sortableColumns?: string[];
	/**
	 * Column ID of the action column that should be sticky/floating
	 */
	actionColumnId?: string;
	/**
	 * Additional className for the table container
	 */
	className?: string;
	/**
	 * Whether the table is in a loading state
	 * When true, shows skeleton rows instead of data
	 */
	isLoading?: boolean;
	/**
	 * Number of skeleton rows to show when loading
	 * Defaults to 5
	 */
	skeletonRowCount?: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	storageKey,
	initialSorting = [],
	sortableColumns,
	actionColumnId,
	className,
	isLoading = false,
	skeletonRowCount = 5,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

	// Load sorting and column sizing from localStorage on mount
	useEffect(() => {
		if (!storageKey) return;

		try {
			// Load sorting
			const sortingKey = `${storageKey}-sorting`;
			const storedSorting = localStorage.getItem(sortingKey);
			if (storedSorting) {
				const parsed = JSON.parse(storedSorting);
				if (Array.isArray(parsed) && parsed.length > 0) {
					setSorting(parsed);
				}
			}

			// Load column sizing
			const sizingKey = `${storageKey}-sizing`;
			const storedSizing = localStorage.getItem(sizingKey);
			if (storedSizing) {
				const parsed = JSON.parse(storedSizing);
				if (parsed && typeof parsed === "object") {
					setColumnSizing(parsed);
				}
			}
		} catch (error) {
			console.warn("Failed to load table state from localStorage:", error);
		}
	}, [storageKey]);

	// Save sorting state to localStorage whenever it changes
	const handleSortingChange = (
		updater: SortingState | ((old: SortingState) => SortingState),
	) => {
		setSorting((old) => {
			const newSorting = typeof updater === "function" ? updater(old) : updater;

			// Save to localStorage if storageKey is provided
			if (storageKey) {
				try {
					const sortingKey = `${storageKey}-sorting`;
					localStorage.setItem(sortingKey, JSON.stringify(newSorting));
				} catch (error) {
					console.warn("Failed to save sorting state to localStorage:", error);
				}
			}

			return newSorting;
		});
	};

	// Save column sizing state to localStorage whenever it changes
	const handleColumnSizingChange = (
		updater:
			| ColumnSizingState
			| ((old: ColumnSizingState) => ColumnSizingState),
	) => {
		setColumnSizing((old) => {
			const newSizing = typeof updater === "function" ? updater(old) : updater;

			// Save to localStorage if storageKey is provided
			if (storageKey) {
				try {
					const sizingKey = `${storageKey}-sizing`;
					localStorage.setItem(sizingKey, JSON.stringify(newSizing));
				} catch (error) {
					console.warn(
						"Failed to save column sizing state to localStorage:",
						error,
					);
				}
			}

			return newSizing;
		});
	};

	// Process columns to add sorting configuration
	const processedColumns = useMemo(() => {
		return columns.map((column) => {
			// Get column identifier (id or accessorKey)
			const columnId = column.id || (column as any).accessorKey;

			// If sortableColumns is defined, only make those columns sortable
			if (sortableColumns && columnId) {
				const isSortable = sortableColumns.includes(columnId);
				return {
					...column,
					enableSorting: isSortable,
				};
			}
			// Otherwise, use the column's enableSorting setting (defaults to true)
			return column;
		});
	}, [columns, sortableColumns]);

	const table = useReactTable({
		data,
		columns: processedColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: handleSortingChange,
		onColumnSizingChange: handleColumnSizingChange,
		enableColumnResizing: true,
		columnResizeMode: "onChange",
		state: {
			sorting,
			columnSizing,
		},
	});

	return (
		<div className={`relative overflow-auto ${className ?? ""}`}>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const isActionColumn = header.column.id === actionColumnId;
								const canSort = header.column.getCanSort();
								const sortDirection = header.column.getIsSorted();

								const headerSize = header.getSize();
								const canResize = header.column.getCanResize();
								const isResizing = header.column.getIsResizing();

								return (
									<TableHead
										key={header.id}
										className={cn(
											isActionColumn
												? "sticky right-0 z-10 bg-background min-w-[80px]"
												: "",
											isResizing && "relative",
										)}
										style={{
											width: headerSize,
											...(isActionColumn
												? {
														boxShadow: "-2px 0 4px rgba(0, 0, 0, 0.1)",
												  }
												: {}),
										}}
									>
										{header.isPlaceholder ? null : (
											<div className="flex items-center gap-2 relative h-full pr-1">
												{canSort ? (
													<div
														className="flex items-center gap-2 flex-1 cursor-pointer hover:text-foreground select-none"
														onClick={() => header.column.toggleSorting()}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														{sortDirection === "asc" ? (
															<ArrowUp className="h-4 w-4 opacity-70" />
														) : sortDirection === "desc" ? (
															<ArrowDown className="h-4 w-4 opacity-70" />
														) : (
															<ArrowUpDown className="h-4 w-4 opacity-30" />
														)}
													</div>
												) : (
													<div className="flex-1">
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</div>
												)}
												{canResize && (
													<div
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														className={cn(
															"absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none z-20",
														)}
													>
														<div
															className={cn(
																"absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors",
																isResizing
																	? "bg-primary"
																	: "bg-border opacity-0 hover:opacity-100",
															)}
														/>
													</div>
												)}
											</div>
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{isLoading ? (
						// Skeleton rows
						Array.from({ length: skeletonRowCount }).map((_, index) => (
							<TableRow key={`skeleton-${index}`}>
								{table.getHeaderGroups()[0]?.headers.map((header) => {
									const isActionColumn = header.column.id === actionColumnId;
									const cellSize = header.getSize();
									return (
										<TableCell
											key={header.id}
											className={
												isActionColumn
													? "sticky right-0 z-10 bg-background min-w-[80px]"
													: ""
											}
											style={{
												width: cellSize,
												...(isActionColumn
													? {
															boxShadow: "-2px 0 4px rgba(0, 0, 0, 0.1)",
													  }
													: {}),
											}}
										>
											<Skeleton className="h-4 w-full" />
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => {
									const isActionColumn = cell.column.id === actionColumnId;
									const cellSize = cell.column.getSize();
									return (
										<TableCell
											key={cell.id}
											className={
												isActionColumn
													? "sticky right-0 z-10 bg-background min-w-[80px]"
													: ""
											}
											style={{
												width: cellSize,
												...(isActionColumn
													? {
															boxShadow: "-2px 0 4px rgba(0, 0, 0, 0.1)",
													  }
													: {}),
											}}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
