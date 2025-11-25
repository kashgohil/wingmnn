import { ModuleColorProvider } from "@/components/ModuleColorProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import type { Project } from "@/lib/api/projects.api";
import type { Task } from "@/lib/api/tasks.api";
import { useAuth } from "@/lib/auth/auth-context";
import { useProject, useUpdateProjectStatus } from "@/lib/hooks/use-projects";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useUserProfile } from "@/lib/hooks/use-users";
import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
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
	Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const module = getModuleBySlug("projects");
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

export const Route = createFileRoute("/projects_/$projectId")({
	component: ProjectDetailsPage,
	head: ({ params }) =>
		generateMetadata({
			title: `Project ${params.projectId}`,
			description: "Deep dive into a single project, its work, and analytics.",
			noindex: true,
			path: `/projects/${params.projectId}`,
		}),
});

function ProjectDetailsPage() {
	const { projectId } = Route.useParams();
	const Icon = module?.icon;
	const { user } = useAuth();
	const { data: project, isLoading, error } = useProject(projectId);
	const { data: projectTasks = [], isLoading: tasksLoading } = useTasks({
		projectId,
	});
	const [settingsOpen, setSettingsOpen] = useState(false);
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

		return Object.entries(grouped).map(([statusId, tasks]) => ({
			statusId,
			label:
				statusId === "unassigned"
					? "Unassigned"
					: `Status ${statusId.slice(0, 6)}`,
			tasks,
		}));
	}, [projectTasks]);

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
			{ label: "Priority", value: getPriorityLabel(project.priority) },
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

	const isProjectLoaded = !isLoading && !!project;
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
													className="w-64 p-0"
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
													onClick={() => setSettingsOpen(true)}
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

						<section className="rounded-none border border-border bg-card/70 p-4 md:p-6">
							<Tabs
								value={activeView}
								onValueChange={(value) => setActiveView(value as ViewTab)}
							>
								<div className="overflow-x-auto">
									<TabsList className="inline-flex min-w-full justify-start gap-2">
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
														<CardTitle className="text-base font-semibold">
															{column.label}{" "}
															<span className="text-sm text-muted-foreground">
																({column.tasks.length})
															</span>
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-3">
														{column.tasks.map((task) => (
															<div
																key={task.id}
																className="rounded-none border border-border bg-background p-3"
															>
																<p className="font-medium">{task.title}</p>
																{task.description && (
																	<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
																		{task.description}
																	</p>
																)}
																<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
																	<span>
																		Priority: {getPriorityLabel(task.priority)}
																	</span>
																	<span>Progress: {task.progress ?? 0}%</span>
																</div>
															</div>
														))}
													</CardContent>
												</Card>
											))}
										</div>
									) : (
										<EmptyState message="No tasks yet. Create tasks to populate the board." />
									)}
								</TabsContent>

								<TabsContent
									value="list"
									className="mt-6"
								>
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
																	{getPriorityLabel(task.priority)}
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
								</TabsContent>

								<TabsContent
									value="timeline"
									className="mt-6"
								>
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
														{entry.description && (
															<p className="text-sm text-muted-foreground">
																{entry.description}
															</p>
														)}
														<div className="text-xs text-muted-foreground">
															Progress {entry.progress}% · Priority{" "}
															{getPriorityLabel(entry.priority)}
														</div>
													</div>
												))}
											</CardContent>
										</Card>
									) : (
										<EmptyState message="No dated tasks yet. Add start or due dates to see a timeline." />
									)}
								</TabsContent>

								<TabsContent
									value="calendar"
									className="mt-6"
								>
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

											<Card>
												<CardHeader>
													<CardTitle>Progress Snapshot</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-3">
														<ProgressRow
															label="Completed"
															value={taskStats.completed}
															total={taskStats.total}
														/>
														<ProgressRow
															label="In Progress"
															value={taskStats.inProgress}
															total={taskStats.total}
														/>
														<ProgressRow
															label="Upcoming"
															value={taskStats.upcoming}
															total={taskStats.total}
														/>
														<ProgressRow
															label="Overdue"
															value={taskStats.overdue}
															total={taskStats.total}
															emphasize
														/>
													</div>
												</CardContent>
											</Card>

											<ProjectAnalyticsPanel
												tasks={projectTasks}
												loading={false}
											/>
										</>
									)}
								</TabsContent>
							</Tabs>
						</section>
					</div>
				</div>
				<ProjectSettingsDialog
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
					project={project}
					loading={!isProjectLoaded}
				/>
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
		<div className="rounded-none border border-dashed border-border/60 bg-background/60 p-4">
			<p className="text-sm uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<div className="mt-2 flex items-end gap-2">
				<p className="text-3xl font-semibold">{value}</p>
				{trend === "positive" && (
					<span className="text-xs text-emerald-500">On track</span>
				)}
				{trend === "negative" && (
					<span className="text-xs text-destructive">Needs attention</span>
				)}
			</div>
		</div>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-sm font-medium text-foreground">{value}</p>
		</div>
	);
}

function ProgressRow({
	label,
	value,
	total,
	emphasize,
}: {
	label: string;
	value: number;
	total: number;
	emphasize?: boolean;
}) {
	const percent = total ? Math.round((value / total) * 100) : 0;
	return (
		<div>
			<div className="flex items-center justify-between text-sm">
				<span
					className={emphasize ? "text-destructive font-semibold" : undefined}
				>
					{label}
				</span>
				<span className={!total ? "text-muted-foreground" : "text-foreground"}>
					{value}
				</span>
			</div>
			<div className="mt-2 h-1.5 rounded-full bg-muted">
				<div
					className={`h-full rounded-full ${
						emphasize ? "bg-destructive" : "bg-primary"
					}`}
					style={{ width: `${percent}%` }}
				/>
			</div>
		</div>
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

function ProjectSettingsDialog({
	open,
	onOpenChange,
	project,
	loading,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project?: Project | null;
	loading: boolean;
}) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Project Settings</DialogTitle>
					<DialogDescription>
						View the configuration currently applied to this project. Additional
						editing tools are in progress.
					</DialogDescription>
				</DialogHeader>
				{loading ? (
					<LoadingState label="Loading settings..." />
				) : project ? (
					<div className="space-y-4">
						<Detail
							label="Default View"
							value={project.settings?.selectedView ?? "Overview"}
						/>
						<Detail
							label="Time Tracking"
							value={
								project.settings?.enableTimeTracking ? "Enabled" : "Disabled"
							}
						/>
						<Detail
							label="Notifications"
							value={
								project.settings?.enableNotifications ? "Enabled" : "Disabled"
							}
						/>
						<Detail
							label="Created"
							value={formatDate(project.createdAt)}
						/>
						<Detail
							label="Updated"
							value={formatDate(project.updatedAt)}
						/>
					</div>
				) : (
					<EmptyState message="Project not found." />
				)}
			</DialogContent>
		</Dialog>
	);
}

function ProjectAnalyticsPanel({
	tasks,
	loading,
}: {
	tasks: Task[];
	loading: boolean;
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
		<div className="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Priority Breakdown</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{Object.entries(priorityBreakdown).map(([priority, count]) => (
						<div
							key={priority}
							className="flex items-center justify-between rounded-none border border-border/60 px-3 py-2"
						>
							<span className="capitalize">{priority}</span>
							<span className="font-semibold">{count}</span>
						</div>
					))}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Status Snapshot</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{Object.entries(statusBreakdown).map(([statusId, count]) => (
						<div
							key={statusId}
							className="flex items-center justify-between rounded-none border border-border/60 px-3 py-2"
						>
							<span>
								{statusId === "unassigned"
									? "Unassigned"
									: `Status ${statusId.slice(0, 6)}`}
							</span>
							<span className="font-semibold">{count}</span>
						</div>
					))}
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

const PRIORITY_LABELS: Record<
	NonNullable<Project["priority"] | Task["priority"]>,
	string
> = {
	low: "Low",
	medium: "Medium",
	high: "High",
	critical: "Critical",
};

function getPriorityLabel(
	priority: Project["priority"] | Task["priority"] | null | undefined,
) {
	if (!priority) return "Unset";
	return PRIORITY_LABELS[priority] ?? priority;
}
