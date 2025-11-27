import { ModuleColorProvider } from "@/components/ModuleColorProvider";
import { PriorityLabel } from "@/components/projects/PriorityLabel";
import { ProjectsDialogs } from "@/components/projects/ProjectsDialogs";
import { TaskCard } from "@/components/projects/TaskCard";
import { useProjectsDialogs } from "@/components/projects/useProjectsDialogs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RichTextRenderer } from "@/components/rich-text/RichTextRenderer";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getProject, type Project } from "@/lib/api/projects.api";
import type { Task } from "@/lib/api/tasks.api";
import { useAuth } from "@/lib/auth/auth-context";
import { useProject, useUpdateProjectStatus } from "@/lib/hooks/use-projects";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useUserProfile } from "@/lib/hooks/use-users";
import { useWorkflow } from "@/lib/hooks/use-workflows";
import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { type PriorityValue } from "@/lib/priority";
import { toast } from "@/lib/toast";
import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	CalendarDays,
	ChevronDownIcon,
	Clock3,
	Info,
	KanbanSquare,
	List,
	Plus,
	Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const module = getModuleBySlug("projects");
const DEFAULT_PROJECT_DESCRIPTION =
	"Deep dive into a single project, its work, and analytics.";
const viewTabs = [
	"board",
	"list",
	"timeline",
	"calendar",
	"analytics",
] as const;
type ViewTab = (typeof viewTabs)[number];

const PROJECT_STATUS_OPTIONS: Array<{
	value: Project["status"];
	label: string;
	hint: string;
}> = [
	{
		value: "active",
		label: "Active",
		hint: "Project is moving forward",
	},
	{
		value: "on_hold",
		label: "On Hold",
		hint: "Temporarily paused work",
	},
	{
		value: "completed",
		label: "Completed",
		hint: "All work is finished",
	},
	{
		value: "archived",
		label: "Archived",
		hint: "Read-only historical record",
	},
];

export const Route = createFileRoute("/projects/$projectId")({
	ssr: false,
	loader: async ({ params, context }) => {
		const { projectId } = params;

		if (!projectId) {
			throw new Error("Project ID is required");
		}

		const project = await context.queryClient.ensureQueryData({
			queryKey: ["projects", projectId],
			queryFn: () => getProject(projectId),
		});

		return { project };
	},
	component: ProjectDetailsPage,
	head: ({ params, loaderData }) => {
		const project = loaderData?.project;
		const title = project?.name ?? `Project ${params.projectId}`;

		return generateMetadata({
			title,
			description: project?.description ?? DEFAULT_PROJECT_DESCRIPTION,
			noindex: true,
			path: `/projects/${params.projectId}`,
		});
	},
});

function ProjectDetailsPage() {
	const { projectId } = Route.useParams();
	const Icon = module?.icon;
	const { user } = useAuth();
	const { data: project, error } = useProject(projectId);
	const { data: projectTasks = [], isLoading: tasksLoading } = useTasks({
		projectId,
	});
	const { data: workflow } = useWorkflow(project?.workflowId ?? null);
	const { openProjectSettings, openTaskCreation } = useProjectsDialogs();
	const [activeView, setActiveView] = useState<ViewTab>("board");
	const [initialViewApplied, setInitialViewApplied] = useState(false);
	const [infoOpen, setInfoOpen] = useState(false);
	const [statusMenuOpen, setStatusMenuOpen] = useState(false);
	const infoPopoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { mutate: updateProjectStatus, isPending: isUpdatingProjectStatus } =
		useUpdateProjectStatus();

	useEffect(() => {
		const preferredView = project?.settings?.selectedView;

		if (!initialViewApplied && preferredView) {
			if (preferredView === "overview") {
				setActiveView("board");
				setInitialViewApplied(true);
				return;
			}

			if (viewTabs.includes(preferredView as ViewTab)) {
				setActiveView(preferredView as ViewTab);
				setInitialViewApplied(true);
			}
		}
	}, [project?.settings?.selectedView, initialViewApplied]);

	useEffect(() => {
		return () => {
			if (infoPopoverTimeoutRef.current) {
				clearTimeout(infoPopoverTimeoutRef.current);
			}
		};
	}, []);

	// Create a map of statusId to status info (name and colorCode)
	const statusMap = useMemo(() => {
		const map = new Map<string, { name: string; colorCode: string }>();
		if (workflow?.statuses) {
			workflow.statuses.forEach((status) => {
				map.set(status.id, {
					name: status.name,
					colorCode: status.colorCode,
				});
			});
		}
		return map;
	}, [workflow]);

	const taskStats = useMemo(() => {
		const stats = {
			total: projectTasks.length,
			completed: 0,
			inProgress: 0,
			overdue: 0,
			upcoming: 0,
		};

		if (!projectTasks.length) {
			return stats;
		}

		const now = Date.now();

		projectTasks.forEach((task) => {
			if (task.progress === 100) {
				stats.completed += 1;
				return;
			}
			stats.inProgress += 1;
			if (task.dueDate) {
				const due = new Date(task.dueDate).getTime();
				if (due < now) {
					stats.overdue += 1;
				} else {
					stats.upcoming += 1;
				}
			}
		});

		return stats;
	}, [projectTasks]);

	const tasksByStatus = useMemo(() => {
		if (!projectTasks.length) return [];
		const grouped = projectTasks.reduce<Record<string, typeof projectTasks>>(
			(acc, task) => {
				const key = task.statusId ?? "unassigned";
				acc[key] = acc[key] || [];
				acc[key].push(task);
				return acc;
			},
			{},
		);

		return Object.entries(grouped).map(([statusId, tasks]) => {
			const statusInfo = statusMap.get(statusId);
			return {
				statusId,
				label:
					statusId === "unassigned"
						? "Unassigned"
						: statusInfo?.name ?? `Status ${statusId.slice(0, 6)}`,
				colorCode: statusInfo?.colorCode ?? "#808080",
				tasks,
			};
		});
	}, [projectTasks, statusMap]);

	const timelineEntries = useMemo(() => {
		return [...projectTasks]
			.sort((a, b) => {
				const aDate = a.dueDate || a.startDate || a.createdAt;
				const bDate = b.dueDate || b.startDate || b.createdAt;
				return new Date(aDate).getTime() - new Date(bDate).getTime();
			})
			.map((task) => ({
				id: task.id,
				title: task.title,
				date: formatDate(task.dueDate || task.startDate || task.createdAt),
				priority: task.priority,
				progress: task.progress ?? 0,
				description: task.description,
			}));
	}, [projectTasks]);

	const calendarBuckets = useMemo(() => {
		const buckets: Record<string, typeof projectTasks> = {};
		projectTasks.forEach((task) => {
			const due = task.dueDate
				? new Date(task.dueDate)
				: task.startDate
				? new Date(task.startDate)
				: null;
			const key = due
				? due.toLocaleDateString(undefined, {
						month: "short",
						year: "numeric",
				  })
				: "No date";
			buckets[key] = buckets[key] || [];
			buckets[key].push(task);
		});
		return buckets;
	}, [projectTasks]);

	const infoDetails = useMemo(() => {
		if (!project) return [];
		return [
			{
				label: "Priority",
				value: (
					<PriorityLabel
						priority={project.priority}
						className="justify-end"
					/>
				),
			},
			{ label: "Category", value: project.category ?? "None" },
			{ label: "Key", value: project.key ?? "None" },
			{
				label: "Start Date",
				value: project.startDate ? formatDate(project.startDate) : "TBD",
			},
			{
				label: "End Date",
				value: project.endDate ? formatDate(project.endDate) : "TBD",
			},
		];
	}, [project]);

	const ownerId = project?.ownerId;
	const { data: ownerProfile, isLoading: ownerLoading } =
		useUserProfile(ownerId);

	const isOwner = !!(project && user?.id && user.id === project.ownerId);

	const handleStatusChange = (
		value: Project["status"],
		afterSettled?: () => void,
	) => {
		if (!project || value === project.status) {
			return;
		}

		updateProjectStatus(
			{ id: project.id, status: value },
			{
				onSuccess: () => {
					toast.success(`Project marked as ${getProjectStatusLabel(value)}`, {
						description: "Status updated successfully.",
					});
				},
				onError: (mutationError) => {
					const message =
						mutationError instanceof Error
							? mutationError.message
							: "Failed to update project status";
					toast.error(message);
				},
				onSettled: () => {
					afterSettled?.();
				},
			},
		);
	};

	if (error) {
		return (
			<div className="p-8">
				<Card>
					<CardHeader>
						<CardTitle>Unable to load project</CardTitle>
					</CardHeader>
					<CardContent>
						{error instanceof Error ? error.message : "Unknown error"}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<ProtectedRoute>
			<ModuleColorProvider moduleSlug="projects">
				<div className="min-h-screen text-foreground p-6 md:p-8">
					<div className="mx-auto flex max-w-7xl flex-col gap-8">
						<header className="flex flex-col gap-6 rounded-none">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="flex flex-wrap items-center gap-4">
									{Icon && (
										<div
											className="retro-border p-6"
											style={{ backgroundColor: `var(${module?.colorVar})` }}
										>
											<Icon className="h-12 w-12 text-primary-foreground" />
										</div>
									)}
									<div>
										<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
											Projects
										</p>
										<h1 className="text-4xl font-mono font-bold md:text-4xl">
											{project?.name ?? "Loading project..."}
										</h1>
										{project?.description && (
											<p className="mt-2 max-w-2xl text-muted-foreground">
												{project.description}
											</p>
										)}
									</div>
								</div>
								<div className="flex flex-wrap items-center justify-end gap-2">
									{project?.status &&
										project &&
										(isOwner ? (
											<DropdownMenu
												open={statusMenuOpen}
												onOpenChange={setStatusMenuOpen}
											>
												<DropdownMenuTrigger asChild>
													<Button
														className="uppercase tracking-wide h-10 pl-3 pr-2! gap-2"
														aria-label="Project status"
														disabled={isUpdatingProjectStatus}
													>
														{getProjectStatusLabel(project.status)}
														<ChevronDownIcon className="size-4 opacity-50" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="w-64"
												>
													<DropdownMenuLabel className="px-3 py-2">
														Select project status
													</DropdownMenuLabel>
													<DropdownMenuSeparator />
													{PROJECT_STATUS_OPTIONS.map((option) => (
														<DropdownMenuItem
															key={option.value}
															disabled={isUpdatingProjectStatus}
															selected={option.value === project.status}
															onSelect={(event: Event) => {
																event.preventDefault();
																handleStatusChange(option.value, () =>
																	setStatusMenuOpen(false),
																);
															}}
															className="flex flex-col items-start gap-1 whitespace-normal"
														>
															<span className="font-semibold">
																{option.label}
															</span>
															<span className="text-xs text-muted-foreground">
																{option.hint}
															</span>
														</DropdownMenuItem>
													))}
												</DropdownMenuContent>
											</DropdownMenu>
										) : (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<div className="inline-flex">
															<Button className="uppercase tracking-wide h-10 px-3 pointer-events-none disabled:opacity-100 disabled:cursor-default">
																{getProjectStatusLabel(project.status)}
															</Button>
														</div>
													</TooltipTrigger>
													<TooltipContent side="bottom">
														<div className="space-y-1">
															<p className="font-semibold">
																{getProjectStatusLabel(project.status)}
															</p>
															<p className="text-xs text-muted-foreground">
																{getProjectStatusDescription(project.status)}
															</p>
															<p className="text-[11px] text-muted-foreground/80">
																Only the owner can change this status.
															</p>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										))}

									{project && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														size="icon"
														variant="outline"
														onClick={() =>
															openTaskCreation({
																projectId,
																projectName: project.name ?? undefined,
																workflowId: project.workflowId,
															})
														}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent side="bottom">
													Create New task
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}

									{project && (
										<Popover
											open={infoOpen}
											onOpenChange={setInfoOpen}
										>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													aria-label="Project info"
													onMouseEnter={() => {
														if (infoPopoverTimeoutRef.current) {
															clearTimeout(infoPopoverTimeoutRef.current);
															infoPopoverTimeoutRef.current = null;
														}
														setInfoOpen(true);
													}}
													onMouseLeave={() => {
														infoPopoverTimeoutRef.current = setTimeout(() => {
															setInfoOpen(false);
														}, 100);
													}}
												>
													<Info className="h-5 w-5" />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												align="end"
												className="w-72 space-y-4 p-4"
												onMouseEnter={() => {
													if (infoPopoverTimeoutRef.current) {
														clearTimeout(infoPopoverTimeoutRef.current);
														infoPopoverTimeoutRef.current = null;
													}
													setInfoOpen(true);
												}}
												onMouseLeave={() => {
													infoPopoverTimeoutRef.current = setTimeout(() => {
														setInfoOpen(false);
													}, 100);
												}}
											>
												{ownerId && (
													<div className="rounded-none border border-border/60 bg-muted/40 p-3 space-y-2">
														<p className="text-xs uppercase tracking-wide text-muted-foreground mb-0">
															Owner
														</p>
														<div className="flex items-center gap-3">
															<Avatar
																name={
																	ownerProfile?.name ??
																	(ownerLoading
																		? "Loading owner"
																		: "Unassigned")
																}
																size="sm"
															/>
															<div className="flex-1">
																<p className="text-sm font-semibold">
																	{ownerLoading
																		? "Fetching owner..."
																		: ownerProfile?.name ?? "Unassigned"}
																</p>
																<p className="text-xs text-muted-foreground">
																	{ownerLoading
																		? "Retrieving profile details"
																		: ownerProfile?.email || "Project owner"}
																</p>
															</div>
														</div>
													</div>
												)}
												<div className="space-y-2 text-sm">
													{infoDetails.map(({ label, value }) => (
														<div
															key={label}
															className="flex items-center justify-between gap-3"
														>
															<span className="text-muted-foreground">
																{label}:
															</span>
															<span className="font-semibold text-right text-foreground">
																{value}
															</span>
														</div>
													))}
												</div>
											</PopoverContent>
										</Popover>
									)}

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													onClick={() => openProjectSettings({ projectId })}
													aria-label="Project settings"
												>
													<Settings className="h-5 w-5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent side="bottom">
												Project settings
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</header>

						<Tabs
							value={activeView}
							onValueChange={(value) => setActiveView(value as ViewTab)}
						>
							<div className="overflow-x-auto">
								<TabsList className="inline-flex w-max gap-2">
									<TabTrigger
										icon={KanbanSquare}
										value="board"
										label="Board"
									/>
									<TabTrigger
										icon={List}
										value="list"
										label="List"
									/>
									<TabTrigger
										icon={Clock3}
										value="timeline"
										label="Timeline"
									/>
									<TabTrigger
										icon={CalendarDays}
										value="calendar"
										label="Calendar"
									/>
									<TabTrigger
										icon={BarChart3}
										value="analytics"
										label="Analytics"
									/>
								</TabsList>
							</div>

							<TabsContent
								value="board"
								className="mt-6"
							>
								<section className="rounded-none retro-border bg-card/70 p-4 md:p-6">
									{tasksLoading ? (
										<LoadingState label="Loading board..." />
									) : tasksByStatus.length ? (
										<div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
											{tasksByStatus.map((column) => (
												<Card
													key={column.statusId}
													className="bg-muted/40"
												>
													<CardHeader>
														<CardTitle className="text-base font-semibold flex items-center gap-2">
															<div
																className="w-3 h-3 rounded-full"
																style={{ backgroundColor: column.colorCode }}
															/>
															{column.label}{" "}
															<span className="text-sm text-muted-foreground">
																({column.tasks.length})
															</span>
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-3">
														{column.tasks.map((task) => (
															<TaskCard
																key={task.id}
																task={task}
																statusMap={statusMap}
															/>
														))}
													</CardContent>
												</Card>
											))}
										</div>
									) : (
										<EmptyState message="No tasks yet. Create tasks to populate the board." />
									)}
								</section>
							</TabsContent>

							<TabsContent
								value="list"
								className="mt-6"
							>
								<section className="rounded-none retro-border bg-card/70 p-4 md:p-6">
									{tasksLoading ? (
										<LoadingState label="Loading tasks..." />
									) : projectTasks.length ? (
										<Card>
											<CardHeader>
												<CardTitle>Task List</CardTitle>
											</CardHeader>
											<CardContent className="overflow-x-auto">
												<table className="min-w-full text-sm">
													<thead>
														<tr className="text-left text-muted-foreground">
															<th className="py-2 pr-4 font-medium">Title</th>
															<th className="py-2 pr-4 font-medium">
																Priority
															</th>
															<th className="py-2 pr-4 font-medium">Due</th>
															<th className="py-2 pr-4 font-medium">
																Progress
															</th>
														</tr>
													</thead>
													<tbody>
														{projectTasks.map((task) => (
															<tr
																key={task.id}
																className="border-t border-border/80"
															>
																<td className="py-3 pr-4 font-medium">
																	{task.title}
																</td>
																<td className="py-3 pr-4">
																	<PriorityLabel
																		priority={task.priority}
																		className="text-sm"
																	/>
																</td>
																<td className="py-3 pr-4">
																	{task.dueDate
																		? formatDate(task.dueDate)
																		: "—"}
																</td>
																<td className="py-3 pr-4">
																	{task.progress ?? 0}%
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</CardContent>
										</Card>
									) : (
										<EmptyState message="No tasks have been added to this project." />
									)}
								</section>
							</TabsContent>

							<TabsContent
								value="timeline"
								className="mt-6"
							>
								<section className="rounded-none retro-border bg-card/70 p-4 md:p-6">
									{tasksLoading ? (
										<LoadingState label="Building timeline..." />
									) : timelineEntries.length ? (
										<Card>
											<CardHeader>
												<CardTitle>Timeline</CardTitle>
											</CardHeader>
											<CardContent className="space-y-4">
												{timelineEntries.map((entry) => (
													<div
														key={entry.id}
														className="relative pl-6"
													>
														<div className="absolute left-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-border bg-background" />
														<p className="text-xs uppercase tracking-wide text-muted-foreground">
															{entry.date}
														</p>
														<p className="font-semibold">{entry.title}</p>
														<RichTextRenderer
															value={entry.description}
															className="text-sm text-muted-foreground"
														/>
														<div className="text-xs text-muted-foreground">
															Progress {entry.progress}% ·{" "}
															<span className="inline-flex items-center gap-1.5">
																Priority
																<PriorityLabel
																	priority={entry.priority}
																	className="text-xs text-muted-foreground"
																	iconClassName="size-3.5"
																/>
															</span>
														</div>
													</div>
												))}
											</CardContent>
										</Card>
									) : (
										<EmptyState message="No dated tasks yet. Add start or due dates to see a timeline." />
									)}
								</section>
							</TabsContent>

							<TabsContent
								value="calendar"
								className="mt-6"
							>
								<section className="rounded-none retro-border bg-card/70 p-4 md:p-6">
									{tasksLoading ? (
										<LoadingState label="Loading calendar..." />
									) : Object.keys(calendarBuckets).length ? (
										<div className="grid gap-4 md:grid-cols-2">
											{Object.entries(calendarBuckets).map(
												([bucket, tasks]) => (
													<Card key={bucket}>
														<CardHeader>
															<CardTitle className="text-base font-semibold">
																{bucket}{" "}
																<span className="text-sm text-muted-foreground">
																	({tasks.length})
																</span>
															</CardTitle>
														</CardHeader>
														<CardContent className="space-y-3">
															{tasks.map((task) => (
																<div
																	key={task.id}
																	className="rounded-none border border-dashed border-border/70 p-3"
																>
																	<p className="font-medium">{task.title}</p>
																	<p className="text-xs text-muted-foreground">
																		Due{" "}
																		{task.dueDate
																			? formatDate(task.dueDate)
																			: "TBD"}
																	</p>
																</div>
															))}
														</CardContent>
													</Card>
												),
											)}
										</div>
									) : (
										<EmptyState message="Dates haven't been scheduled for this project." />
									)}
								</section>
							</TabsContent>

							<TabsContent
								value="analytics"
								className="mt-6 space-y-6"
							>
								{tasksLoading ? (
									<LoadingState label="Loading analytics..." />
								) : (
									<>
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
											<SummaryStat
												label="Total tasks"
												value={taskStats.total}
											/>
											<SummaryStat
												label="Completed"
												value={taskStats.completed}
												trend="positive"
											/>
											<SummaryStat
												label="In progress"
												value={taskStats.inProgress}
											/>
											<SummaryStat
												label="Overdue"
												value={taskStats.overdue}
												trend={taskStats.overdue ? "negative" : undefined}
											/>
										</div>

										<ProjectAnalyticsPanel
											tasks={projectTasks}
											loading={false}
											statusMap={statusMap}
										/>
									</>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</div>
				{/* All Project Dialogs */}
				<ProjectsDialogs />
			</ModuleColorProvider>
		</ProtectedRoute>
	);
}

function SummaryStat({
	label,
	value,
	trend,
}: {
	label: string;
	value: number;
	trend?: "positive" | "negative";
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{label}</CardTitle>
				{trend === "positive" && (
					<span className="text-[11px] font-semibold text-emerald-500">
						On track
					</span>
				)}
				{trend === "negative" && (
					<span className="text-[11px] font-semibold text-destructive">
						Needs attention
					</span>
				)}
			</CardHeader>
			<CardContent>
				<p className="text-3xl font-bold">{value}</p>
				<p className="text-xs text-muted-foreground mt-1">
					vs. previous period
				</p>
			</CardContent>
		</Card>
	);
}

function LoadingState({ label }: { label: string }) {
	return (
		<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
			{label}
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-8 text-center text-muted-foreground">
			{message}
		</div>
	);
}

function TabTrigger({
	icon: IconComponent,
	label,
	value,
}: {
	icon: LucideIcon;
	label: string;
	value: ViewTab;
}) {
	return (
		<TabsTrigger
			value={value}
			className="flex items-center gap-2"
		>
			<IconComponent className="h-4 w-4" />
			{label}
		</TabsTrigger>
	);
}

function ProjectAnalyticsPanel({
	tasks,
	loading,
	statusMap,
}: {
	tasks: Task[];
	loading: boolean;
	statusMap: Map<string, { name: string; colorCode: string }>;
}) {
	if (loading) {
		return <LoadingState label="Loading analytics..." />;
	}

	if (!tasks.length) {
		return <EmptyState message="Add tasks to unlock analytics." />;
	}

	const priorityBreakdown = tasks.reduce<Record<string, number>>(
		(acc, task) => {
			acc[task.priority] = (acc[task.priority] || 0) + 1;
			return acc;
		},
		{},
	);

	const statusBreakdown = tasks.reduce<Record<string, number>>((acc, task) => {
		const key = task.statusId ?? "unassigned";
		acc[key] = (acc[key] || 0) + 1;
		return acc;
	}, {});

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Priority</CardTitle>
					<span className="text-xs text-muted-foreground">Breakdown</span>
				</CardHeader>
				<CardContent className="space-y-2">
					{Object.entries(priorityBreakdown).map(([priority, count]) => {
						const typedPriority = priority as PriorityValue;
						return (
							<div
								key={priority}
								className="flex items-center justify-between text-sm"
							>
								<PriorityLabel
									priority={typedPriority}
									className="text-sm text-muted-foreground"
									iconClassName="size-3.5"
								/>
								<span className="font-semibold">{count}</span>
							</div>
						);
					})}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Status</CardTitle>
					<span className="text-xs text-muted-foreground">Snapshot</span>
				</CardHeader>
				<CardContent className="space-y-2">
					{Object.entries(statusBreakdown).map(([statusId, count]) => {
						const statusInfo = statusMap.get(statusId);
						return (
							<div
								key={statusId}
								className="flex items-center justify-between text-sm"
							>
								<span className="inline-flex items-center gap-1.5 text-muted-foreground">
									{statusId === "unassigned" ? (
										"Unassigned"
									) : (
										<>
											<div
												className="w-2 h-2 rounded-full"
												style={{
													backgroundColor: statusInfo?.colorCode ?? "#808080",
												}}
											/>
											{statusInfo?.name ?? `Status ${statusId.slice(0, 6)}`}
										</>
									)}
								</span>
								<span className="font-semibold">{count}</span>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}

function getProjectStatusLabel(status: Project["status"]) {
	const match = PROJECT_STATUS_OPTIONS.find(
		(option) => option.value === status,
	);
	return match?.label ?? status;
}

function getProjectStatusDescription(status: Project["status"]) {
	const match = PROJECT_STATUS_OPTIONS.find(
		(option) => option.value === status,
	);
	return match?.hint ?? "Status details unavailable.";
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
