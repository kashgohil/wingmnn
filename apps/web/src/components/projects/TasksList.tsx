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
	const { data: tasks = [], isLoading, error } = useMyTasks();
	const { data: projects = [] } = useProjects();
	const { data: statusMap } = useTaskStatusMap();
	const [filterPriority, setFilterPriority] = useState<string>("all");
	const [filterProject, setFilterProject] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("dueDate");
	const [sortDirection] = useState<SortDirection>("asc");

	// Filter and sort tasks
	const filteredAndSortedTasks = useMemo(() => {
		let filtered = [...tasks];

		// Apply filters
		if (filterPriority !== "all") {
			filtered = filtered.filter((task) => task.priority === filterPriority);
		}
		if (filterProject !== "all") {
			filtered = filtered.filter((task) => task.projectId === filterProject);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortField) {
				case "title":
					comparison = a.title.localeCompare(b.title);
					break;
				case "priority":
					const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
					comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
					break;
				case "dueDate":
					const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
					const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
					comparison = aDate - bDate;
					break;
				case "createdAt":
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}

			return sortDirection === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [tasks, filterPriority, filterProject, sortField, sortDirection]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground">Loading tasks...</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Tasks</CardTitle>
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

	if (tasks.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground">No tasks assigned to you.</div>
				</CardContent>
			</Card>
		);
	}

	const emptyStatusMap = useMemo(
		() => new Map<string, { name: string; colorCode: string }>(),
		[],
	);

	return (
		<Card className="px-5 pb-5">
			<CardHeader className="mb-4">
				<div className="flex items-center justify-between">
					<CardTitle>My Tasks ({filteredAndSortedTasks.length})</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className="flex flex-wrap gap-2 mb-4">
					<Select
						value={filterPriority}
						onValueChange={setFilterPriority}
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
				{filteredAndSortedTasks.length === 0 ? (
					<div className="text-muted-foreground text-center py-8">
						No tasks match the selected filters.
					</div>
				) : (
					<div className="space-y-3">
						{filteredAndSortedTasks.map((task) => {
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
