/**
 * Tasks List Component
 * Displays tasks currently assigned to the user
 */

import { RichTextRenderer } from "@/components/rich-text/RichTextRenderer";
import { useProjects } from "@/lib/hooks/use-projects";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import {
	getPriorityLabel,
	PRIORITY_META,
	type PriorityValue,
} from "@/lib/priority";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
	const [filterPriority, setFilterPriority] = useState<string>("all");
	const [filterProject, setFilterProject] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("dueDate");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

	const now = new Date();
	const toggleSortDirection = () => {
		setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
	};

	return (
		<Card>
			<CardHeader className="mb-4 p-0">
				<div className="flex items-center justify-between">
					<CardTitle>My Tasks ({filteredAndSortedTasks.length})</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleSortDirection}
							title={`Sort ${
								sortDirection === "asc" ? "Descending" : "Ascending"
							}`}
						>
							<ArrowUpDown className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className="flex flex-wrap gap-2 mb-4">
					<Select
						value={filterPriority}
						onValueChange={setFilterPriority}
					>
						<SelectTrigger className="w-[140px]">
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
						<SelectTrigger className="w-[180px]">
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
						<SelectTrigger className="w-[140px]">
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
							const isOverdue = task.dueDate && new Date(task.dueDate) < now;
							const priorityMeta = PRIORITY_META[task.priority];
							const priorityDotClass =
								priorityMeta?.dotClassName ?? "bg-muted-foreground";

							return (
								<div
									key={task.id}
									className="flex items-start justify-between p-3 retro-border rounded-none hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<div
												className={`w-2 h-2 rounded-full ${priorityDotClass}`}
											/>
											<h4 className="font-medium">{task.title}</h4>
											{isOverdue && (
												<Badge
													variant="destructive"
													className="text-xs"
												>
													Overdue
												</Badge>
											)}
										</div>
										<RichTextRenderer
											value={task.description}
											className="mt-1 line-clamp-1 text-sm text-muted-foreground"
										/>
										{task.dueDate && (
											<p
												className={`text-xs mt-1 ${
													isOverdue
														? "text-destructive"
														: "text-muted-foreground"
												}`}
											>
												Due: {new Date(task.dueDate).toLocaleDateString()}
											</p>
										)}
										{(() => {
											const project = projects.find(
												(p) => p.id === task.projectId,
											);
											return project ? (
												<p className="text-xs text-muted-foreground mt-1">
													Project: {project.name}
												</p>
											) : null;
										})()}
									</div>
									<div className="flex items-center gap-2 ml-4">
										<Badge
											variant="outline"
											className="text-xs gap-1.5"
										>
											<PriorityIcon
												priority={task.priority}
												className="size-3.5"
											/>
											<span className="normal-case">
												{getPriorityLabel(task.priority)}
											</span>
										</Badge>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
