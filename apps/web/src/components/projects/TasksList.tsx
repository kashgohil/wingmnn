/**
 * Tasks List Component
 * Displays tasks currently assigned to the user
 */

import { TaskCard } from "@/components/projects/TaskCard";
import { useProjects } from "@/lib/hooks/use-projects";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { useTaskStatusMap } from "@/lib/hooks/use-workflows";
import { getPriorityLabel, type PriorityValue } from "@/lib/priority";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { PriorityIcon } from "./PriorityLabel";

type SortField = "title" | "priority" | "dueDate" | "createdAt";
type SortDirection = "asc" | "desc";
const FILTER_PRIORITY_OPTIONS: PriorityValue[] = [
	"critical",
	"high",
	"medium",
	"low",
];

export function TasksList() {
	const [filterPriority, setFilterPriority] = useState<string>("all");
	const [filterProject, setFilterProject] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("dueDate");
	const [sortDirection] = useState<SortDirection>("asc");

	// Build filter params for backend
	const filterParams = useMemo(() => {
		const params: {
			priority?: PriorityValue;
			projectId?: string;
			sortBy?: string;
			sortDirection?: "asc" | "desc";
		} = {};

		if (filterPriority !== "all") {
			params.priority = filterPriority as PriorityValue;
		}
		if (filterProject !== "all") {
			params.projectId = filterProject;
		}
		if (sortField) {
			params.sortBy = sortField;
		}
		if (sortDirection) {
			params.sortDirection = sortDirection;
		}

		return params;
	}, [filterPriority, filterProject, sortField, sortDirection]);

	const { data: tasks = [], isLoading, error } = useMyTasks(filterParams);
	const { data: projects = [] } = useProjects();
	const { data: statusMap } = useTaskStatusMap();

	const emptyStatusMap = useMemo(
		() => new Map<string, { name: string; colorCode: string }>(),
		[],
	);

	// Only show "no tasks" message if no filters are applied and no tasks exist
	const hasFilters = filterPriority !== "all" || filterProject !== "all";
	const showNoTasksMessage = !hasFilters && tasks.length === 0 && !isLoading;

	if (error) {
		return (
			<Card className="px-5 pb-5">
				<CardHeader className="mb-4">
					<div className="flex items-center justify-between">
						<CardTitle>My Tasks</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-destructive">
						Error loading tasks:{" "}
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="px-5 pb-5">
			<CardHeader className="mb-4">
				<div className="flex items-center justify-between">
					<CardTitle>My Tasks {!isLoading && `(${tasks.length})`}</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className="flex flex-wrap gap-2 mb-4">
					<Select
						value={filterPriority}
						onValueChange={setFilterPriority}
						disabled={isLoading}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priorities</SelectItem>
							{FILTER_PRIORITY_OPTIONS.map((priority) => (
								<SelectItem
									key={priority}
									value={priority}
								>
									<span className="flex items-center gap-2">
										<PriorityIcon priority={priority} />
										{getPriorityLabel(priority)}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={filterProject}
						onValueChange={setFilterProject}
						disabled={isLoading}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Project" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Projects</SelectItem>
							{projects.map((project) => (
								<SelectItem
									key={project.id}
									value={project.id}
								>
									{project.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={sortField}
						onValueChange={(value) => setSortField(value as SortField)}
						disabled={isLoading}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="dueDate">Due Date</SelectItem>
							<SelectItem value="priority">Priority</SelectItem>
							<SelectItem value="title">Title</SelectItem>
							<SelectItem value="createdAt">Created</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Tasks List */}
				{isLoading ? (
					<div className="flex flex-wrap gap-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<Card
								key={index}
								className="relative border border-l-5! retro-border-shadow-sm w-sm"
							>
								<CardHeader className="pb-0 flex flex-row items-center justify-between">
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-6 w-20" />
								</CardHeader>
								<CardContent className="pt-2 flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<div className="flex items-center gap-3">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-4 w-20" />
										</div>
										<div className="flex items-center gap-1">
											<Skeleton className="size-6 rounded-full" />
											<Skeleton className="size-6 rounded-full" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : showNoTasksMessage ? (
					<div className="text-muted-foreground text-center py-8">
						No tasks assigned to you.
					</div>
				) : tasks.length === 0 ? (
					<div className="text-muted-foreground text-center py-8">
						No tasks match the selected filters.
					</div>
				) : (
					<div className="space-y-3">
						{tasks.map((task) => {
							return (
								<TaskCard
									key={task.id}
									task={task}
									statusMap={statusMap || emptyStatusMap}
								/>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
