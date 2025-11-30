/**
 * TaskTable Component
 * A table view for project tasks using TanStack Table
 * Features sortable columns with localStorage persistence and a sticky action column
 */

import { PriorityLabel } from "@/components/projects/PriorityLabel";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/api/tasks.api";
import { useDeleteTask } from "@/lib/hooks/use-tasks";
import { useUserProfile } from "@/lib/hooks/use-users";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/priority";
import { toast } from "@/lib/toast";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface TaskTableProps {
	tasks: Task[];
	statusMap: Map<string, { name: string; colorCode: string }>;
	projectId: string;
	/**
	 * Storage key for persisting sorting preferences
	 * Defaults to `task-table-sort-${projectId}`
	 */
	storageKey?: string;
	/**
	 * Whether the table is in a loading state
	 */
	isLoading?: boolean;
	/**
	 * Custom message to show when there are no tasks
	 * Defaults to "No tasks have been added to this project."
	 */
	emptyStateMessage?: string;
	/**
	 * Callback when task edit is requested
	 */
	onEditTask?: (task: Task) => void;
	/**
	 * Callback when task view is requested
	 */
	onViewTask?: (task: Task) => void;
}

function formatDate(value: string | null | undefined) {
	if (!value) return "—";
	const date = new Date(value);
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function TaskActionsCell({
	task,
}: {
	task: Task;
	onEditTask?: (task: Task) => void;
	onViewTask?: (task: Task) => void;
}) {
	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

	const handleDelete = () => {
		if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
			deleteTask(task.id, {
				onSuccess: () => {
					toast.success("Task deleted successfully");
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : "Failed to delete task",
					);
				},
			});
		}
	};

	return (
		<div className="flex items-center justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						disabled={isDeleting}
					>
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={handleDelete}
						className="text-destructive"
						disabled={isDeleting}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function AssignedToCell({ userId }: { userId: string | null }) {
	const { data: user, isLoading } = useUserProfile(userId);

	if (isLoading) {
		return <span className="text-muted-foreground">Loading...</span>;
	}

	if (!user) {
		return <span className="text-muted-foreground">Unassigned</span>;
	}

	return (
		<div className="flex items-center gap-2">
			<Avatar
				name={user.name || "User"}
				size="sm"
			/>
			<span className="text-sm">{user.name}</span>
		</div>
	);
}

function StatusCell({
	statusId,
	statusMap,
}: {
	statusId: string;
	statusMap: Map<string, { name: string; colorCode: string }>;
}) {
	const status = statusMap.get(statusId);

	if (!status) {
		return <span className="text-muted-foreground">Unknown</span>;
	}

	return (
		<div className="flex items-center gap-2">
			<div
				className="h-2 w-2 rounded-full"
				style={{ backgroundColor: status.colorCode }}
			/>
			<span className="text-sm">{status.name}</span>
		</div>
	);
}

export function TaskTable({
	tasks,
	statusMap,
	projectId,
	storageKey,
	isLoading = false,
	emptyStateMessage = "No tasks have been added to this project.",
	onEditTask,
	onViewTask,
}: TaskTableProps) {
	const defaultStorageKey = `task-table-sort-${projectId}`;
	const finalStorageKey = storageKey ?? defaultStorageKey;

	// Define sortable columns
	const sortableColumns = [
		"title",
		"priority",
		"statusId",
		"dueDate",
		"progress",
		"assignedTo",
		"createdAt",
	];

	// Define filter options for columns with predefined values
	const filterOptions = useMemo(() => {
		const options: Record<
			string,
			Array<{
				value: string;
				label: string;
				icon?: React.ComponentType<{ className?: string }>;
				iconClassName?: string;
				colorCode?: string;
			}>
		> = {};

		// Priority filter options
		options.priority = PRIORITY_ORDER.map((priority) => ({
			value: priority,
			label: PRIORITY_META[priority].label,
			icon: PRIORITY_META[priority].icon,
			iconClassName: PRIORITY_META[priority].iconClassName,
		}));

		// Status filter options
		if (statusMap.size > 0) {
			options.statusId = Array.from(statusMap.entries()).map(
				([id, status]) => ({
					value: id,
					label: status.name,
					colorCode: status.colorCode,
				}),
			);
		}

		return options;
	}, [statusMap]);

	const columns = useMemo<ColumnDef<Task>[]>(
		() => [
			{
				accessorKey: "title",
				id: "title",
				header: "Title",
				size: 300,
				minSize: 150,
				maxSize: 500,
				enableSorting: true,
				cell: ({ row }) => {
					return (
						<div className="font-medium truncate">{row.original.title}</div>
					);
				},
			},
			{
				accessorKey: "priority",
				id: "priority",
				header: "Priority",
				size: 120,
				minSize: 100,
				maxSize: 200,
				enableSorting: true,
				cell: ({ row }) => {
					return <PriorityLabel priority={row.original.priority} />;
				},
			},
			{
				accessorKey: "statusId",
				id: "statusId",
				header: "Status",
				size: 150,
				minSize: 120,
				maxSize: 250,
				enableSorting: true,
				cell: ({ row }) => {
					return (
						<StatusCell
							statusId={row.original.statusId}
							statusMap={statusMap}
						/>
					);
				},
			},
			{
				accessorKey: "dueDate",
				id: "dueDate",
				header: "Due Date",
				size: 130,
				minSize: 100,
				maxSize: 200,
				enableSorting: true,
				cell: ({ row }) => {
					return (
						<span className="text-sm text-muted-foreground">
							{formatDate(row.original.dueDate)}
						</span>
					);
				},
			},
			{
				accessorKey: "progress",
				id: "progress",
				header: "Progress",
				size: 150,
				minSize: 120,
				maxSize: 250,
				enableSorting: true,
				cell: ({ row }) => {
					const progress = row.original.progress ?? 0;
					return (
						<div className="flex items-center gap-2">
							<div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-primary transition-all"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "assignedTo",
				id: "assignedTo",
				header: "Assigned To",
				size: 180,
				minSize: 150,
				maxSize: 300,
				enableSorting: true,
				cell: ({ row }) => {
					return <AssignedToCell userId={row.original.assignedTo} />;
				},
			},
			{
				accessorKey: "createdAt",
				id: "createdAt",
				header: "Created",
				size: 130,
				minSize: 100,
				maxSize: 200,
				enableSorting: true,
				cell: ({ row }) => {
					return (
						<span className="text-sm text-muted-foreground">
							{formatDate(row.original.createdAt)}
						</span>
					);
				},
			},
			{
				id: "actions",
				header: () => <div className="text-right"></div>,
				size: 60,
				minSize: 60,
				maxSize: 60,
				enableResizing: false,
				enableSorting: false,
				cell: ({ row }) => {
					return <TaskActionsCell task={row.original} />;
				},
			},
		],
		[statusMap, onEditTask, onViewTask],
	);

	// Show empty state if not loading and no tasks
	if (!isLoading && tasks.length === 0) {
		return (
			<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-8 text-center text-muted-foreground retro-border">
				{emptyStateMessage}
			</div>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={tasks}
			storageKey={finalStorageKey}
			sortableColumns={sortableColumns}
			filterOptions={filterOptions}
			actionColumnId="actions"
			className="retro-border bg-background"
			isLoading={isLoading}
		/>
	);
}
