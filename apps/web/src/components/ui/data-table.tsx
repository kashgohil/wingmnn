/**
 * DataTable Component
 * A reusable table component built on TanStack Table
 * Supports sorting, column resizing, column reordering, column visibility, and sticky columns
 */

import { createTableStore } from "@/lib/storage/table-storage";
import { cn } from "@/lib/utils";
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnOrderState,
	type ColumnSizingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as _ from "lodash-es";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Columns,
	Filter,
	GripVertical,
} from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "zustand";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
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
	/**
	 * Whether columns can be reordered by dragging
	 * Defaults to true
	 */
	enableColumnReordering?: boolean;
	/**
	 * Filter options for columns
	 * Map of column ID to array of filter option objects with value, label, and optional icon/color
	 * Only columns with filter options will be filterable
	 */
	filterOptions?: Record<
		string,
		Array<{
			value: string;
			label: string;
			icon?: React.ComponentType<{ className?: string }>;
			iconClassName?: string;
			colorCode?: string;
		}>
	>;
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
	enableColumnReordering = true,
	filterOptions,
}: DataTableProps<TData, TValue>) {
	const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
	const [draggedColumnHeader, setDraggedColumnHeader] = useState<any>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const [tableHeight, setTableHeight] = useState<number | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	// Default column order from columns
	const defaultColumnOrder = useMemo(
		() =>
			columns
				.map((col) => col.id || (col as any).accessorKey || "")
				.filter(Boolean),
		[columns],
	);

	// we don't want to listen to storageKey changes, so we use a ref to store the value
	const storageKeyRef = useRef<string | null>(storageKey);
	const tempStoreKeyRef = useRef<string | null>(null);

	// Create Zustand store instance
	// If storageKey is provided, create persistent store; otherwise create temp store
	const store = useMemo(() => {
		if (storageKeyRef.current) {
			// Persistent store - reset temp key ref
			tempStoreKeyRef.current = null;
			return createTableStore(storageKeyRef.current);
		}

		// Temp store - generate random key and track it
		tempStoreKeyRef.current = _.uniqueId("temp-table-");
		return createTableStore(tempStoreKeyRef.current);
	}, []);

	// Initialize store with defaults if no persisted state exists
	useEffect(() => {
		// Note: Zustand persist will hydrate from localStorage automatically,
		// so we only set defaults if the store is truly empty (no persisted data)
		// Wait a tick to ensure persist middleware has hydrated
		const timeoutId = setTimeout(() => {
			const state = store.getState();

			// Initialize sorting with initialSorting if store is empty and initialSorting is provided
			if (state.sorting.length === 0 && initialSorting.length > 0) {
				state.setSorting(initialSorting);
			}

			// Initialize column order with default if store is empty
			if (state.order.length === 0 && defaultColumnOrder.length > 0) {
				state.setOrder(defaultColumnOrder);
			}
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [store, initialSorting, defaultColumnOrder]);

	// Clean up temp store on unmount (only if no storageKey)
	useEffect(() => {
		// Only clean up if this is a temp store (no storageKey)
		if (storageKeyRef.current) return;

		return () => {
			if (!tempStoreKeyRef.current) return;

			// Remove from localStorage
			// Zustand persist doesn't automatically remove entries on unmount
			// no need to clear the store, it will be gc'ed automatically when the component unmounts
			try {
				localStorage.removeItem(tempStoreKeyRef.current);
			} catch (error) {
				console.warn(
					"Failed to remove non-persistent store from localStorage:",
					error,
				);
			}
		};
	}, []);

	// Subscribe to store state using Zustand hooks
	const sorting = useStore(store, (state) => state.sorting);
	const columnFilters = useStore(store, (state) => state.filters);
	const columnSizing = useStore(store, (state) => state.sizing);
	const columnOrder = useStore(store, (state) => state.order);
	const columnVisibility = useStore(store, (state) => state.visibility);

	// Get setters from store
	const setSorting = store.getState().setSorting;
	const setFilters = store.getState().setFilters;
	const setSizing = store.getState().setSizing;
	const setOrder = store.getState().setOrder;
	const setVisibility = store.getState().setVisibility;

	// Handlers that work with updater functions
	const handleSortingChange = (
		updater: SortingState | ((old: SortingState) => SortingState),
	) => {
		if (!setSorting) return;
		const current = store?.getState().sorting || [];
		const newSorting =
			typeof updater === "function" ? updater(current) : updater;
		setSorting(newSorting);
	};

	const handleColumnSizingChange = (
		updater:
			| ColumnSizingState
			| ((old: ColumnSizingState) => ColumnSizingState),
	) => {
		if (!setSizing) return;
		const current = store?.getState().sizing || {};
		const newSizing =
			typeof updater === "function" ? updater(current) : updater;
		setSizing(newSizing);
	};

	const handleColumnVisibilityChange = (
		updater: VisibilityState | ((old: VisibilityState) => VisibilityState),
	) => {
		if (!setVisibility) return;
		const current = store?.getState().visibility || {};
		const newVisibility =
			typeof updater === "function" ? updater(current) : updater;
		setVisibility(newVisibility);
	};

	const handleColumnOrderChange = (
		updater: ColumnOrderState | ((old: ColumnOrderState) => ColumnOrderState),
	) => {
		if (!setOrder) return;
		const current = store?.getState().order || defaultColumnOrder;
		const newOrder = typeof updater === "function" ? updater(current) : updater;
		setOrder(newOrder);
	};

	const handleColumnFiltersChange = (
		updater:
			| ColumnFiltersState
			| ((old: ColumnFiltersState) => ColumnFiltersState),
	) => {
		if (!setFilters) return;
		const current = store?.getState().filters || [];
		const newFilters =
			typeof updater === "function" ? updater(current) : updater;
		setFilters(newFilters);
	};

	// Handle column reordering
	const handleDragStart = (event: DragStartEvent) => {
		const columnId = event.active.id as string;
		setActiveColumnId(columnId);

		// Find the header for the dragged column
		const headerGroup = table.getHeaderGroups()[0];
		const header = headerGroup?.headers.find(
			(h) =>
				h.column.id === columnId ||
				(h.column.columnDef as any).accessorKey === columnId,
		);
		setDraggedColumnHeader(header);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveColumnId(null);
		setDraggedColumnHeader(null);

		if (!over || active.id === over.id) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Don't allow reordering the action column
		if (activeId === actionColumnId || overId === actionColumnId) return;

		handleColumnOrderChange((oldOrder) => {
			const oldIndex = oldOrder.indexOf(activeId);
			const newIndex = oldOrder.indexOf(overId);

			if (oldIndex === -1 || newIndex === -1) return oldOrder;

			const newOrder = [...oldOrder];
			newOrder.splice(oldIndex, 1);
			newOrder.splice(newIndex, 0, activeId);

			return newOrder;
		});
	};

	// Process columns to add sorting and filtering configuration
	const processedColumns = useMemo(() => {
		return columns.map((column) => {
			// Get column identifier (id or accessorKey)
			const columnId = column.id || (column as any).accessorKey;
			const columnFilterOptions = filterOptions?.[columnId];

			// Add custom filter function for columns with filter options
			let filterFn = column.filterFn;
			if (columnFilterOptions) {
				filterFn = (
					row: any,
					columnId: string,
					filterValue: string[] | string | undefined,
				) => {
					if (
						!filterValue ||
						(Array.isArray(filterValue) && filterValue.length === 0)
					) {
						return true;
					}
					const cellValue = row.getValue(columnId);
					const filterArray = Array.isArray(filterValue)
						? filterValue
						: [filterValue];
					return filterArray.includes(cellValue);
				};
			}

			// If sortableColumns is defined, only make those columns sortable
			if (sortableColumns && columnId) {
				const isSortable = sortableColumns.includes(columnId);
				return {
					...column,
					enableSorting: isSortable,
					filterFn,
				};
			}
			// Otherwise, use the column's enableSorting setting (defaults to true)
			return {
				...column,
				filterFn,
			};
		});
	}, [columns, sortableColumns, filterOptions]);

	const table = useReactTable({
		data,
		columns: processedColumns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: handleColumnFiltersChange,
		onColumnSizingChange: handleColumnSizingChange,
		onColumnOrderChange: handleColumnOrderChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		enableColumnResizing: true,
		columnResizeMode: "onChange",
		state: {
			sorting,
			columnFilters,
			columnSizing,
			columnOrder,
			columnVisibility,
		},
	});

	// Measure table height for drag preview
	useEffect(() => {
		if (tableContainerRef.current) {
			const updateHeight = () => {
				const tableElement = tableContainerRef.current?.querySelector("table");
				if (tableElement) {
					setTableHeight(tableElement.offsetHeight);
				}
			};
			updateHeight();
			// Update on resize
			const resizeObserver = new ResizeObserver(updateHeight);
			if (tableContainerRef.current) {
				resizeObserver.observe(tableContainerRef.current);
			}
			return () => resizeObserver.disconnect();
		}
	}, [data, isLoading]);

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div
				ref={tableContainerRef}
				className={`relative overflow-auto ${className ?? ""}`}
			>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isActionColumn = header.column.id === actionColumnId;
									const canSort = header.column.getCanSort();
									const sortDirection = header.column.getIsSorted();
									const columnId =
										header.column.id ||
										(header.column.columnDef as any).accessorKey;
									const canReorder =
										enableColumnReordering && !isActionColumn && columnId;
									// Check if column is actually sorted (asc or desc)
									const isSorted =
										sortDirection === "asc" || sortDirection === "desc";

									const headerSize = header.getSize();
									const canResize = header.column.getCanResize();
									const isResizing = header.column.getIsResizing();

									const columnFilterOptions = filterOptions?.[columnId];
									const canFilter = !!columnFilterOptions;
									const filterValue = header.column.getFilterValue() as
										| string[]
										| string
										| undefined;
									const filterArray = Array.isArray(filterValue)
										? filterValue
										: filterValue
										? [filterValue]
										: [];
									const isFiltered = filterArray.length > 0;

									return (
										<DraggableColumnHeader
											key={header.id}
											header={header}
											columnId={columnId}
											isActionColumn={isActionColumn}
											canSort={canSort}
											sortDirection={sortDirection}
											canReorder={canReorder}
											canResize={canResize}
											isResizing={isResizing}
											headerSize={headerSize}
											isSorted={isSorted}
											activeColumnId={activeColumnId}
											canFilter={canFilter}
											filterValue={filterValue}
											isFiltered={isFiltered}
											filterOptions={columnFilterOptions}
											table={table}
											actionColumnId={actionColumnId}
											columnVisibility={columnVisibility}
											columnOrder={columnOrder}
										/>
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
														? "sticky right-0 z-20 bg-background min-w-[80px]"
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
										const cellColumnId =
											cell.column.id ||
											(cell.column.columnDef as any).accessorKey;
										const isDragging = activeColumnId === cellColumnId;
										// Check if column is actually sorted (asc or desc)
										const cellSortDirection = cell.column.getIsSorted();
										const isSorted =
											cellSortDirection === "asc" ||
											cellSortDirection === "desc";
										return (
											<TableCell
												key={cell.id}
												className={cn(
													isActionColumn
														? "sticky right-0 z-20 bg-background min-w-[80px]"
														: "",
													isSorted && !isActionColumn && "bg-primary/15",
													isDragging && !isActionColumn && "bg-primary/20",
												)}
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
			<DragOverlay>
				{activeColumnId && draggedColumnHeader ? (
					<ColumnDragPreview
						header={draggedColumnHeader}
						table={table}
						tableHeight={tableHeight}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

function ColumnConfiguration({
	table,
	actionColumnId,
	columnVisibility,
	columnOrder,
}: {
	table: ReturnType<typeof useReactTable<any>>;
	actionColumnId: string;
	columnVisibility: VisibilityState;
	columnOrder: ColumnOrderState;
}) {
	const columns = table
		.getAllColumns()
		.filter((col) => col.id !== actionColumnId);
	const filteredColumnOrder = columnOrder.filter((id) => id !== actionColumnId);

	// Sort columns by their current order
	const orderedColumns = useMemo(() => {
		const ordered = filteredColumnOrder
			.map((id) => columns.find((col) => col.id === id))
			.filter(Boolean) as typeof columns;
		// Add any columns not in the order at the end
		const unordered = columns.filter(
			(col) => !filteredColumnOrder.includes(col.id || ""),
		);
		return [...ordered, ...unordered];
	}, [columns, filteredColumnOrder, columnVisibility]);

	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over || active.id === over.id) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		const currentOrder = [...filteredColumnOrder];
		const oldIndex = currentOrder.indexOf(activeId);
		const newIndex = currentOrder.indexOf(overId);

		if (oldIndex === -1 || newIndex === -1) return;

		const newOrder = [...currentOrder];
		newOrder.splice(oldIndex, 1);
		newOrder.splice(newIndex, 0, activeId);

		// Include action column in the final order (at the end)
		table.setColumnOrder([...newOrder, actionColumnId]);
	};

	const columnIds = orderedColumns.map((col) => col.id || "").filter(Boolean);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 shrink-0"
					onClick={(e) => e.stopPropagation()}
				>
					<Columns className="h-4 w-4" />
					<span className="sr-only">Configure columns</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-4"
				align="end"
			>
				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-semibold mb-3">Configure Columns</h4>
						<DndContext
							sensors={sensors}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={columnIds}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-2 max-h-96 overflow-y-auto">
									{orderedColumns.map((column) => {
										const columnId = column.id || "";
										return (
											<SortableColumnItem
												key={columnId}
												column={column}
												columnId={columnId}
												columnVisibility={columnVisibility}
												isDragging={activeId === columnId}
											/>
										);
									})}
								</div>
							</SortableContext>
						</DndContext>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function SortableColumnItem({
	column,
	columnId,
	columnVisibility,
	isDragging,
}: {
	column: any;
	columnId: string;
	columnVisibility: VisibilityState;
	isDragging: boolean;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: columnId,
		});

	const isVisible = columnVisibility[columnId] !== false;
	const header = column.columnDef.header;
	const headerText =
		typeof header === "string"
			? header
			: column.id
			? column.id.charAt(0).toUpperCase() +
			  column.id.slice(1).replace(/([A-Z])/g, " $1")
			: "Column";

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors",
				isDragging && "opacity-50 border-2 border-primary bg-primary/10",
			)}
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
				onClick={(e) => e.stopPropagation()}
			>
				<GripVertical className="h-4 w-4" />
			</div>
			<Checkbox
				checked={isVisible}
				onCheckedChange={(checked) => {
					column.toggleVisibility(checked);
				}}
				onClick={(e) => e.stopPropagation()}
			/>
			<span className="text-sm flex-1">{headerText}</span>
		</div>
	);
}

function ColumnDragPreview({
	header,
	table,
	tableHeight,
}: {
	header: any;
	table: any;
	tableHeight: number | null;
}) {
	const headerSize = header.getSize();
	const rowCount = table.getRowModel().rows.length;
	// Use actual table height if available, otherwise estimate
	const headerHeight = 60; // Approximate header height
	const bodyHeight = tableHeight ? tableHeight - headerHeight : rowCount * 60;

	return (
		<div
			className="bg-background border-2 border-primary shadow-lg overflow-hidden flex flex-col"
			style={{ width: headerSize }}
		>
			{/* Header */}
			<div className="bg-primary/25 border-b-2 border-primary p-4 font-medium shrink-0">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</div>
			{/* Empty rows to match table height */}
			<div
				className="flex flex-col"
				style={{ height: bodyHeight, minHeight: bodyHeight }}
			>
				{Array.from({ length: Math.max(rowCount, 1) }).map((_, index) => (
					<div
						key={index}
						className="p-4 border-b border-border last:border-b-0 flex-1"
					/>
				))}
			</div>
		</div>
	);
}

function DraggableColumnHeader({
	header,
	columnId,
	isActionColumn,
	canSort,
	sortDirection,
	canReorder,
	canResize,
	isResizing,
	headerSize,
	isSorted,
	activeColumnId,
	canFilter,
	filterValue,
	isFiltered,
	filterOptions,
	table,
	actionColumnId,
	columnVisibility,
	columnOrder,
}: {
	header: any;
	columnId: string;
	isActionColumn: boolean;
	canSort: boolean;
	sortDirection: false | "asc" | "desc";
	canReorder: boolean;
	canResize: boolean;
	isResizing: boolean;
	headerSize: number;
	isSorted: boolean;
	activeColumnId: string | null;
	canFilter: boolean;
	filterValue: string[] | string | undefined;
	isFiltered: boolean;
	filterOptions?: Array<{
		value: string;
		label: string;
		icon?: React.ComponentType<{ className?: string }>;
		iconClassName?: string;
		colorCode?: string;
	}>;
	table: ReturnType<typeof useReactTable<any>>;
	actionColumnId?: string;
	columnVisibility: VisibilityState;
	columnOrder: ColumnOrderState;
}) {
	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({
		id: columnId,
		disabled: !canReorder,
	});

	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: columnId,
		disabled: !canReorder,
	});

	// Check if this column is being dragged (using activeColumnId from parent)
	const isBeingDragged = activeColumnId === columnId;

	// Don't apply transform to action column as it breaks sticky positioning
	const style =
		transform && !isActionColumn
			? {
					transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			  }
			: undefined;

	const setRefs = (node: HTMLTableCellElement | null) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};

	return (
		<TableHead
			ref={setRefs}
			className={cn(
				isActionColumn
					? "sticky right-0 z-30 bg-background min-w-[80px]"
					: "relative",
				isBeingDragged &&
					!isActionColumn &&
					"bg-primary/25 border-b-2 border-primary",
				isOver &&
					!isActionColumn &&
					!isBeingDragged &&
					"ring-2 ring-primary/50",
				isSorted &&
					!isActionColumn &&
					!isBeingDragged &&
					"bg-primary/20 border-b-2 border-primary",
			)}
			style={{
				width: headerSize,
				...(isActionColumn
					? {
							boxShadow: "-2px 0 4px rgba(0, 0, 0, 0.1)",
					  }
					: {}),
				...style,
			}}
		>
			{header.isPlaceholder ? null : (
				<div className="group flex items-center gap-2 h-full pr-1">
					{isActionColumn && actionColumnId ? (
						// For action column, show only the column configuration icon, centered
						<div className="flex items-center justify-center flex-1">
							<ColumnConfiguration
								table={table}
								actionColumnId={actionColumnId}
								columnVisibility={columnVisibility}
								columnOrder={columnOrder}
							/>
						</div>
					) : (
						<>
							{canReorder && (
								<div
									{...attributes}
									{...listeners}
									className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0 hidden group-hover:block"
									onClick={(e) => e.stopPropagation()}
								>
									<GripVertical className="h-4 w-4" />
								</div>
							)}
							<div
								className={cn(
									"flex-1 min-w-0 truncate font-semibold",
									canSort && "cursor-pointer hover:text-foreground select-none",
								)}
								onClick={
									canSort ? () => header.column.toggleSorting() : undefined
								}
							>
								{flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)}
							</div>
							<div className="flex items-center gap-1 shrink-0">
								{canSort && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											header.column.toggleSorting();
										}}
										className={cn(
											"p-1 hover:bg-muted rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100",
											isSorted && "text-primary opacity-100",
										)}
										title={
											sortDirection === "asc"
												? "Sort descending"
												: sortDirection === "desc"
												? "Clear sort"
												: "Sort ascending"
										}
									>
										{sortDirection === "asc" ? (
											<ArrowUp className="h-4 w-4" />
										) : sortDirection === "desc" ? (
											<ArrowDown className="h-4 w-4" />
										) : (
											<ArrowUpDown className="h-4 w-4 opacity-50" />
										)}
									</button>
								)}
								{canFilter && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												onClick={(e) => e.stopPropagation()}
												className={cn(
													"p-1 hover:bg-muted rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100",
													isFiltered && "text-primary opacity-100",
												)}
											>
												<Filter className="h-4 w-4" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="w-56 p-1.5"
											align="start"
										>
											<div>
												{isFiltered && (
													<>
														<div className="flex items-center justify-end pt-2">
															<button
																onClick={() =>
																	header.column.setFilterValue(undefined)
																}
																className="text-xs text-muted-foreground hover:text-foreground"
															>
																Clear all
															</button>
														</div>
														<DropdownMenuSeparator />
													</>
												)}
												<div className="max-h-48 overflow-y-auto">
													{filterOptions?.map((option) => {
														const filterArray = Array.isArray(filterValue)
															? filterValue
															: filterValue
															? [filterValue]
															: [];
														const isChecked = filterArray.includes(
															option.value,
														);
														return (
															<DropdownMenuCheckboxItem
																key={option.value}
																checked={isChecked}
																onCheckedChange={(checked) => {
																	const currentArray = Array.isArray(
																		filterValue,
																	)
																		? filterValue
																		: filterValue
																		? [filterValue]
																		: [];
																	if (checked) {
																		header.column.setFilterValue([
																			...currentArray,
																			option.value,
																		]);
																	} else {
																		const newArray = currentArray.filter(
																			(v) => v !== option.value,
																		);
																		header.column.setFilterValue(
																			newArray.length > 0
																				? newArray
																				: undefined,
																		);
																	}
																}}
																className="flex items-center gap-2"
															>
																{option.icon && (
																	<option.icon
																		className={cn(
																			"h-4 w-4 shrink-0",
																			option.iconClassName,
																		)}
																	/>
																)}
																{option.colorCode && (
																	<div
																		className="h-2 w-2 rounded-full shrink-0"
																		style={{
																			backgroundColor: option.colorCode,
																		}}
																	/>
																)}
																<span className="text-sm flex-1">
																	{option.label}
																</span>
															</DropdownMenuCheckboxItem>
														);
													})}
												</div>
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</>
					)}
					{!isActionColumn && canResize && (
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
}
