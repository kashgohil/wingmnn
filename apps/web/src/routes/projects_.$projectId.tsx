import { ModuleColorProvider } from "@/components/ModuleColorProvider";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { PriorityLabel } from "@/components/projects/PriorityLabel";
import { ProjectAnalytics } from "@/components/projects/ProjectAnalytics";
import { ProjectCalendar } from "@/components/projects/ProjectCalendar";
import { ProjectsDialogs } from "@/components/projects/ProjectsDialogs";
import { TaskTable } from "@/components/projects/TaskTable";
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
import { useAuth } from "@/lib/auth/auth-context";
import { useProject, useUpdateProjectStatus } from "@/lib/hooks/use-projects";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useUserProfile } from "@/lib/hooks/use-users";
import { useWorkflow } from "@/lib/hooks/use-workflows";
import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
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
				<div className="h-screen text-foreground p-6 md:p-8 overflow-y-auto">
					<div
						className={cn(
							"mx-auto flex max-w-7xl flex-col gap-8",
							activeView === "analytics" ? "" : "h-full",
						)}
					>
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
							className="flex flex-col gap-6 flex-1 overflow-hidden"
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
								className="m-0 flex-1"
							>
								<KanbanBoard
									tasks={projectTasks}
									statusMap={statusMap}
									isLoading={tasksLoading}
									statuses={workflow?.statuses ?? []}
								/>
							</TabsContent>

							<TabsContent
								value="list"
								className="m-0 flex-1"
							>
								<TaskTable
									isLoading={tasksLoading}
									tasks={projectTasks}
									statusMap={statusMap}
									projectId={projectId}
									onEditTask={(task) => {
										// TODO: Implement task edit dialog
										console.log("Edit task:", task);
									}}
									onViewTask={(task) => {
										// TODO: Implement task view dialog
										console.log("View task:", task);
									}}
								/>
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
								className="m-0 flex-1 overflow-hidden"
							>
								<ProjectCalendar
									project={project ?? null}
									workflow={
										workflow
											? {
													statuses: workflow.statuses ?? [],
											  }
											: null
									}
									projectId={projectId}
								/>
							</TabsContent>

							<TabsContent
								value="analytics"
								className="m-0 flex-1"
							>
								<ProjectAnalytics
									tasks={projectTasks}
									loading={tasksLoading}
									statusMap={statusMap}
								/>
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
