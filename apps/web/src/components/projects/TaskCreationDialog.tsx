import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/lib/api/tasks.api";
import type { WorkflowStatus } from "@/lib/api/workflows.api";
import { useProject, useProjectMembers } from "@/lib/hooks/use-projects";
import { useCreateSubtask } from "@/lib/hooks/use-subtasks";
import { useAddTagToTask, useProjectTags } from "@/lib/hooks/use-tags";
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { useUserProfile } from "@/lib/hooks/use-users";
import { useWorkflow, useWorkflows } from "@/lib/hooks/use-workflows";
import {
	getPriorityLabel,
	PRIORITY_META,
	PRIORITY_ORDER,
} from "@/lib/priority";
import { isRichTextEmpty } from "@/lib/rich-text";
import { toast } from "@/lib/toast";
import { useForm } from "@tanstack/react-form";
import { catchError, getTranslucentColor } from "@wingmnn/utils";
import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "../rich-text/RichTextEditor";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";
import { PriorityIcon, PriorityLabel } from "./PriorityLabel";

function AssigneeDisplay({ userId }: { userId: string }) {
	const { data: user } = useUserProfile(userId);
	return (
		<div className="flex items-center gap-2">
			<Avatar
				name={user?.name || "User"}
				size="sm"
				className="size-6"
				style={{ boxShadow: "none" }}
			/>
			<span className="text-sm">{user?.name || "Loading..."}</span>
		</div>
	);
}

type SubtaskDraft = {
	title: string;
	description: string;
	priority: NonNullable<Task["priority"]>;
	statusId: string;
	assignedTo: string;
	startDate: string;
	dueDate: string;
};

function getDefaultSubtaskDraft(initialStatusId?: string): SubtaskDraft {
	return {
		title: "",
		description: "",
		priority: "medium",
		statusId: initialStatusId ?? "",
		assignedTo: "",
		startDate: "",
		dueDate: "",
	};
}

const PRIORITY_OPTIONS = PRIORITY_ORDER.map((priority) => ({
	value: priority,
	label: PRIORITY_META[priority].label,
	description: PRIORITY_META[priority].description,
}));

type TaskCreationFormValues = {
	title: string;
	description: string;
	priority: NonNullable<Task["priority"]>;
	statusId: string;
	assignedTo: string;
	startDate: string;
	dueDate: string;
	estimatedHours: string;
	estimatedPoints: string;
	tagIds: string[];
};

function getDefaultTaskCreationValues(): TaskCreationFormValues {
	return {
		title: "",
		description: "",
		priority: "medium",
		statusId: "",
		assignedTo: "",
		startDate: "",
		dueDate: "",
		estimatedHours: "",
		estimatedPoints: "",
		tagIds: [],
	};
}

interface TaskCreationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string | null;
	projectName?: string;
	workflowId?: string | null;
}

export function TaskCreationDialog({
	open,
	onOpenChange,
	projectId,
	projectName,
	workflowId,
}: TaskCreationDialogProps) {
	const createTask = useCreateTask();
	const createSubtask = useCreateSubtask();
	const addTagToTask = useAddTagToTask();
	const { data: workflow, isLoading: workflowLoading } = useWorkflow(
		workflowId ?? null,
	);
	const { data: subtaskWorkflows } = useWorkflows({
		type: "subtask",
		limit: 1,
	});
	const subtaskWorkflowId = subtaskWorkflows?.[0]?.id ?? null;
	const { data: subtaskWorkflow, isLoading: subtaskWorkflowLoading } =
		useWorkflow(subtaskWorkflowId);
	const { data: project } = useProject(projectId);
	const { data: projectMembers = [] } = useProjectMembers(projectId);
	const { data: projectTags = [] } = useProjectTags(projectId);
	const subtaskStatusOptions = useMemo<WorkflowStatus[]>(() => {
		if (!subtaskWorkflow?.statuses?.length) {
			return [];
		}
		return [...subtaskWorkflow.statuses].sort(
			(a, b) => a.position - b.position,
		);
	}, [subtaskWorkflow?.statuses]);
	const subtaskStatusMap = useMemo(() => {
		const map = new Map<string, { name: string; colorCode: string }>();
		subtaskStatusOptions.forEach((status) => {
			map.set(status.id, {
				name: status.name,
				colorCode: status.colorCode,
			});
		});
		return map;
	}, [subtaskStatusOptions]);

	const [subtaskForm, setSubtaskForm] = useState<SubtaskDraft>(() =>
		getDefaultSubtaskDraft(),
	);
	const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
	const [showSubtaskForm, setShowSubtaskForm] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const form = useForm({
		defaultValues: getDefaultTaskCreationValues(),
		onSubmit: async ({ value }) => {
			if (!projectId) {
				toast.error("Project not loaded", {
					description: "Please wait for the project to finish loading.",
				});
				return;
			}

			if (!value.title.trim()) {
				toast.error("Task title is required");
				return;
			}

			const hoursNumber = value.estimatedHours.trim()
				? Number(value.estimatedHours)
				: undefined;
			const pointsNumber = value.estimatedPoints.trim()
				? Number(value.estimatedPoints)
				: undefined;

			const payload: Parameters<typeof createTask.mutateAsync>[0] = {
				projectId,
				title: value.title.trim(),
				description: isRichTextEmpty(value.description)
					? undefined
					: value.description,
				priority: value.priority,
				statusId: value.statusId || undefined,
				assignedTo: value.assignedTo || undefined,
				startDate: value.startDate || undefined,
				dueDate: value.dueDate || undefined,
				estimatedHours:
					typeof hoursNumber === "number" && Number.isFinite(hoursNumber)
						? hoursNumber
						: undefined,
				estimatedPoints:
					typeof pointsNumber === "number" && Number.isFinite(pointsNumber)
						? pointsNumber
						: undefined,
			};

			const [task, error] = await catchError(createTask.mutateAsync(payload));

			if (error || !task) {
				toast.error("Failed to create task", {
					description:
						error instanceof Error
							? error.message
							: "Failed to create task. Please try again.",
				});
				return;
			}

			// Add tags to the task
			if (value.tagIds.length > 0) {
				for (const tagId of value.tagIds) {
					const [, tagError] = await catchError(
						addTagToTask.mutateAsync({ taskId: task.id, tagId }),
					);

					if (tagError) {
						toast.error("Failed to add tag", {
							description:
								tagError instanceof Error
									? tagError.message
									: "Failed to add tag to task.",
						});
					}
				}
			}

			if (subtasks.length > 0) {
				for (const subtask of subtasks) {
					if (!subtask.title.trim()) continue;

					const [, subtaskError] = await catchError(
						createSubtask.mutateAsync({
							taskId: task.id,
							title: subtask.title.trim(),
							description: isRichTextEmpty(subtask.description)
								? undefined
								: subtask.description,
							priority: subtask.priority,
							statusId: subtask.statusId || undefined,
							assignedTo: subtask.assignedTo || undefined,
							startDate: subtask.startDate || undefined,
							dueDate: subtask.dueDate || undefined,
						}),
					);

					if (subtaskError) {
						toast.error("Failed to create subtask", {
							description:
								subtaskError instanceof Error
									? subtaskError.message
									: `Unable to add "${subtask.title}".`,
						});
					}
				}
			}

			toast.success("Task created", {
				description: `"${task.title}" has been added to ${
					projectName ?? "this project"
				}${subtasks.length ? " with subtasks" : ""}.`,
			});
			resetForm();
			onOpenChange(false);
		},
	});

	const statusOptions = useMemo(() => {
		if (!workflow?.statuses?.length) {
			return [];
		}
		return [...workflow.statuses].sort((a, b) => a.position - b.position);
	}, [workflow?.statuses]);
	const statusMap = useMemo(() => {
		const map = new Map<string, { name: string; colorCode: string }>();
		statusOptions.forEach((status) => {
			map.set(status.id, {
				name: status.name,
				colorCode: status.colorCode,
			});
		});
		return map;
	}, [statusOptions]);

	const resetForm = useCallback(() => {
		form.reset(getDefaultTaskCreationValues());
		setSubtasks([]);
		setSubtaskForm(getDefaultSubtaskDraft(subtaskStatusOptions[0]?.id));
		setShowSubtaskForm(false);
	}, [form, subtaskStatusOptions]);

	useEffect(() => {
		if (open) {
			resetForm();
		}
	}, [open, resetForm]);

	useEffect(() => {
		if (!open || !statusOptions.length) {
			return;
		}
		if (!form.state.values.statusId) {
			form.setFieldValue("statusId", statusOptions[0]?.id ?? "");
		}
	}, [open, statusOptions, form]);

	useEffect(() => {
		const defaultStatusId = subtaskStatusOptions[0]?.id;
		if (defaultStatusId && !subtaskForm.statusId) {
			setSubtaskForm((current) => ({
				...current,
				statusId: current.statusId || defaultStatusId,
			}));
		}
	}, [subtaskStatusOptions, subtaskForm.statusId]);

	const hasChanges = subtasks.length > 0 || form.state.isDirty;

	const handleCancelClick = useCallback(() => {
		if (hasChanges) {
			setShowConfirmDialog(true);
			return;
		}

		resetForm();
		onOpenChange(false);
	}, [hasChanges, resetForm, onOpenChange]);

	const handleConfirmDiscard = useCallback(() => {
		setShowConfirmDialog(false);
		resetForm();
		onOpenChange(false);
	}, [resetForm, onOpenChange]);

	const handleCancelDiscard = useCallback(() => {
		setShowConfirmDialog(false);
	}, []);

	const handleAddSubtask = () => {
		const trimmedTitle = subtaskForm.title.trim();
		if (!trimmedTitle) {
			toast.error("Subtask title is required");
			return;
		}

		setSubtasks((current) => [
			...current,
			{
				...subtaskForm,
				title: trimmedTitle,
			},
		]);
		setSubtaskForm(getDefaultSubtaskDraft(subtaskStatusOptions[0]?.id));
	};

	const handleRemoveSubtask = (index: number) => {
		setSubtasks((current) => current.filter((_, idx) => idx !== index));
	};

	const handleClearSubtaskForm = () => {
		setSubtaskForm(getDefaultSubtaskDraft(subtaskStatusOptions[0]?.id));
	};

	const canSubmit = Boolean(
		projectId && form.state.values.title.trim().length > 0,
	);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={handleCancelClick}
			>
				<DialogContent
					className={`${
						showSubtaskForm
							? "max-w-[calc(48rem+480px+3rem)] max-h-[92vh]"
							: "max-w-3xl max-h-[85vh]"
					} flex flex-col`}
				>
					<DialogHeader>
						<DialogTitle>Create Task</DialogTitle>
						<DialogDescription>
							Add a new task to {projectName ?? "this project"}
						</DialogDescription>
					</DialogHeader>

					<form
						className="flex-1 flex flex-col overflow-hidden min-h-0"
						noValidate
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 min-h-0">
							{/* Left Column - Main Task Form */}
							<div className="flex-1 overflow-y-auto min-w-0">
								<div className="space-y-6">
									{/* Title and Description */}
									<div>
										<Label htmlFor="task-title">Title *</Label>
										<form.Field name="title">
											{(field) => (
												<Input
													id="task-title"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													placeholder="Write a clear task title"
													className="mt-2"
												/>
											)}
										</form.Field>
									</div>
									<div>
										<Label htmlFor="task-description">Description</Label>
										<form.Field name="description">
											{(field) => (
												<div className="mt-2">
													<RichTextEditor
														id="task-description"
														value={field.state.value}
														onChange={field.handleChange}
														containerClassName="bg-transparent"
														contentClassName="bg-transparent min-h-[200px]"
														placeholderClassName="text-muted-foreground/70"
														toolbarClassName="bg-transparent"
														placeholder="Add helpful context (optional)"
													/>
												</div>
											)}
										</form.Field>
									</div>

									{/* Metadata Grid */}
									{/* Row 1: Priority, Status, Assignee */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										<div>
											<Label htmlFor="task-priority">Priority</Label>
											<form.Field name="priority">
												{(field) => (
													<Select
														value={field.state.value}
														onValueChange={(
															value: NonNullable<Task["priority"]>,
														) => field.handleChange(value)}
													>
														<SelectTrigger
															id="task-priority"
															className="mt-2"
														>
															<SelectValue asChild>
																<PriorityLabel
																	priority={field.state.value}
																	className="text-sm font-medium"
																/>
															</SelectValue>
														</SelectTrigger>
														<SelectContent>
															{PRIORITY_OPTIONS.map((option) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																	description={option.description}
																>
																	<span className="flex items-center gap-2">
																		<PriorityIcon priority={option.value} />
																		{option.label}
																	</span>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											</form.Field>
										</div>

										<div>
											<Label>Status</Label>
											{workflowId ? (
												<form.Field name="statusId">
													{(field) => (
														<Select
															value={field.state.value}
															onValueChange={(value) =>
																field.handleChange(value)
															}
															disabled={
																!statusOptions.length ||
																createTask.isPending ||
																workflowLoading
															}
														>
															<SelectTrigger className="mt-2">
																<SelectValue
																	placeholder={
																		workflowLoading
																			? "Loading statuses..."
																			: statusOptions.length
																			? "Select status"
																			: "No statuses available"
																	}
																>
																	{field.state.value &&
																		statusMap.get(field.state.value) && (
																			<div className="flex items-center gap-2">
																				<div
																					className="h-2 w-2 rounded-full shrink-0"
																					style={{
																						backgroundColor: statusMap.get(
																							field.state.value,
																						)?.colorCode,
																					}}
																				/>
																				<span>
																					{
																						statusMap.get(field.state.value)
																							?.name
																					}
																				</span>
																			</div>
																		)}
																</SelectValue>
															</SelectTrigger>
															<SelectContent>
																{statusOptions.map((status) => (
																	<SelectItem
																		key={status.id}
																		value={status.id}
																	>
																		<div className="flex items-center gap-2">
																			<div
																				className="h-2 w-2 rounded-full shrink-0"
																				style={{
																					backgroundColor: status.colorCode,
																				}}
																			/>
																			<span>{status.name}</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													)}
												</form.Field>
											) : (
												<p className="text-sm text-muted-foreground mt-2">
													Assign this project to a workflow to enable status
													tracking.
												</p>
											)}
										</div>

										<div>
											<Label>Assignee</Label>
											<form.Field name="assignedTo">
												{(field) => {
													const userMembers = projectMembers.filter(
														(m) => m.userId !== null,
													);
													const ownerId = project?.ownerId;
													const allUserIds = new Set<string>();
													if (ownerId) {
														allUserIds.add(ownerId);
													}
													userMembers.forEach((member) => {
														if (member.userId) {
															allUserIds.add(member.userId);
														}
													});
													const assigneeOptions = Array.from(allUserIds).sort(
														(a, b) => {
															if (a === ownerId) return -1;
															if (b === ownerId) return 1;
															return 0;
														},
													);

													return (
														<Select
															value={field.state.value}
															onValueChange={(value) =>
																field.handleChange(value || "")
															}
															disabled={createTask.isPending}
														>
															<SelectTrigger className="mt-2">
																<SelectValue placeholder="Unassigned" />
															</SelectTrigger>
															<SelectContent>
																{assigneeOptions.map((userId) => (
																	<SelectItem
																		key={userId}
																		value={userId}
																	>
																		<AssigneeDisplay userId={userId} />
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													);
												}}
											</form.Field>
										</div>
									</div>

									{/* Row 2: Start Date, Due Date, Estimated Hours, Estimated Points */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<div>
											<Label>Start Date</Label>
											<div className="mt-2">
												<form.Field name="startDate">
													{(field) => (
														<DatePicker
															value={field.state.value}
															onChange={(value) =>
																field.handleChange(value || "")
															}
															max={form.state.values.dueDate || undefined}
															placeholder="Start date"
														/>
													)}
												</form.Field>
											</div>
										</div>

										<div>
											<Label>Due Date</Label>
											<div className="mt-2">
												<form.Field name="dueDate">
													{(field) => (
														<DatePicker
															value={field.state.value}
															onChange={(value) =>
																field.handleChange(value || "")
															}
															min={form.state.values.startDate || undefined}
															placeholder="Due date"
														/>
													)}
												</form.Field>
											</div>
										</div>

										<div>
											<Label htmlFor="task-hours">Estimated Hours</Label>
											<form.Field name="estimatedHours">
												{(field) => (
													<Input
														id="task-hours"
														type="number"
														min="0"
														step="0.5"
														value={field.state.value}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														placeholder="e.g. 4"
														className="mt-2"
													/>
												)}
											</form.Field>
										</div>

										<div>
											<Label htmlFor="task-points">Estimated Points</Label>
											<form.Field name="estimatedPoints">
												{(field) => (
													<Input
														id="task-points"
														type="number"
														min="0"
														step="1"
														value={field.state.value}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														placeholder="e.g. 5"
														className="mt-2"
													/>
												)}
											</form.Field>
										</div>
									</div>

									{/* Tags */}
									<div>
										<Label>Tags</Label>
										<form.Field name="tagIds">
											{(field) => (
												<div className="mt-2 max-h-48 overflow-y-auto border-2 border-border retro-border-shadow-sm p-4">
													{projectTags.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															No tags available.
														</p>
													) : (
														<div className="grid grid-cols-2 gap-2">
															{projectTags.map((tag) => (
																<div
																	key={tag.id}
																	className="flex items-center gap-2"
																>
																	<Checkbox
																		id={`tag-${tag.id}`}
																		checked={field.state.value.includes(tag.id)}
																		onCheckedChange={(checked: boolean) => {
																			const currentIds = field.state.value;
																			if (checked) {
																				field.handleChange([
																					...currentIds,
																					tag.id,
																				]);
																			} else {
																				field.handleChange(
																					currentIds.filter(
																						(id) => id !== tag.id,
																					),
																				);
																			}
																		}}
																		disabled={createTask.isPending}
																	/>
																	<label
																		htmlFor={`tag-${tag.id}`}
																		className="flex items-center gap-2 text-sm cursor-pointer flex-1"
																	>
																		<div
																			className="size-3 rounded-sm"
																			style={{ backgroundColor: tag.colorCode }}
																		/>
																		<span>{tag.name}</span>
																	</label>
																</div>
															))}
														</div>
													)}
												</div>
											)}
										</form.Field>
									</div>

									{/* Queued Subtasks List */}
									{subtasks.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<CheckCircle2 className="size-4 text-muted-foreground" />
												<h4 className="text-sm font-bold">
													Queued Subtasks ({subtasks.length})
												</h4>
											</div>
											<TooltipProvider>
												<div className="space-y-2 pr-2">
													{subtasks.map((subtask, index) => (
														<div
															key={`${subtask.title}-${index}`}
															className="flex items-center gap-3 p-2 pl-4 border-2 border-border border-l-4 retro-border-shadow-sm bg-background"
															style={{
																borderColor: getTranslucentColor(
																	subtaskStatusMap.get(subtask.statusId)
																		?.colorCode ?? "var(--color-border)",
																	0.6,
																),
															}}
														>
															<span className="text-base font-semibold flex-1 truncate">
																{subtask.title}
															</span>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div>
																		<PriorityIcon
																			priority={subtask.priority}
																			className="size-5 shrink-0"
																		/>
																	</div>
																</TooltipTrigger>
																<TooltipContent
																	side="bottom"
																	className="text-xs"
																>
																	{getPriorityLabel(subtask.priority)}
																</TooltipContent>
															</Tooltip>
															{subtaskStatusMap.get(subtask.statusId) && (
																<Tooltip>
																	<TooltipTrigger asChild>
																		<div
																			className="h-4 w-4 rounded-full"
																			style={{
																				backgroundColor: subtaskStatusMap.get(
																					subtask.statusId,
																				)?.colorCode,
																			}}
																		/>
																	</TooltipTrigger>
																	<TooltipContent
																		side="bottom"
																		className="text-xs"
																	>
																		{
																			subtaskStatusMap.get(subtask.statusId)
																				?.name
																		}
																	</TooltipContent>
																</Tooltip>
															)}
															<Button
																type="button"
																size="icon-sm"
																variant="destructive"
																onClick={() => handleRemoveSubtask(index)}
																disabled={
																	createTask.isPending ||
																	createSubtask.isPending
																}
																className="shrink-0"
															>
																<Trash2 className="size-4" />
															</Button>
														</div>
													))}
												</div>
											</TooltipProvider>
										</div>
									)}

									{/* Add Subtasks Button */}
									{!showSubtaskForm && (
										<div>
											<Button
												type="button"
												onClick={() => setShowSubtaskForm(true)}
												className="w-full"
												disabled={
													createTask.isPending || createSubtask.isPending
												}
											>
												<Plus className="size-4 mr-2" />
												Add Subtasks
											</Button>
										</div>
									)}
								</div>
							</div>

							{/* Right Column - Subtask Panel */}
							{showSubtaskForm && (
								<div className="w-full lg:w-[480px] border-2 border-border retro-border-shadow-sm bg-muted/30 flex flex-col shrink-0">
									{/* Subtask Panel Header */}
									<div className="border-b-2 border-border px-4 py-3 shrink-0">
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-2">
												<h3 className="text-lg font-bold">Subtasks</h3>
												{subtasks.length > 0 && (
													<span className="ml-auto text-sm font-mono bg-primary/20 px-2 py-0.5 rounded">
														{subtasks.length}
													</span>
												)}
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setShowSubtaskForm(false)}
												className="ml-auto"
												disabled={
													createTask.isPending || createSubtask.isPending
												}
											>
												Hide
											</Button>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											Break down this task into smaller steps
										</p>
									</div>

									{/* Subtask Creation Form - Always Visible */}
									<div className="flex-1 flex flex-col justify-between gap-6 overflow-y-auto p-4">
										<div className="space-y-6">
											<div>
												<Label htmlFor="subtask-title">Subtask Title</Label>
												<Input
													id="subtask-title"
													value={subtaskForm.title}
													onChange={(event) =>
														setSubtaskForm((current) => ({
															...current,
															title: event.target.value,
														}))
													}
													placeholder="What needs to be done?"
													className="mt-2"
													disabled={
														createTask.isPending || createSubtask.isPending
													}
												/>
											</div>

											<div>
												<Label htmlFor="subtask-description">Description</Label>
												<div className="mt-2">
													<RichTextEditor
														id="subtask-description"
														value={subtaskForm.description}
														onChange={(value) =>
															setSubtaskForm((current) => ({
																...current,
																description: value,
															}))
														}
														containerClassName="bg-transparent"
														contentClassName="bg-transparent min-h-[100px]"
														placeholderClassName="text-muted-foreground/70"
														toolbarClassName="bg-transparent"
														placeholder="Optional details..."
													/>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<Label>Priority</Label>
													<Select
														value={subtaskForm.priority}
														onValueChange={(
															value: NonNullable<Task["priority"]>,
														) =>
															setSubtaskForm((current) => ({
																...current,
																priority: value,
															}))
														}
														disabled={
															createTask.isPending || createSubtask.isPending
														}
													>
														<SelectTrigger className="mt-2">
															<SelectValue asChild>
																<PriorityLabel
																	priority={subtaskForm.priority}
																	className="text-sm font-medium"
																/>
															</SelectValue>
														</SelectTrigger>
														<SelectContent>
															{PRIORITY_OPTIONS.map((option) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																>
																	<span className="flex items-center gap-2">
																		<PriorityIcon priority={option.value} />
																		{option.label}
																	</span>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div>
													<Label>Status</Label>
													{subtaskWorkflowId ? (
														<Select
															value={subtaskForm.statusId}
															onValueChange={(value) =>
																setSubtaskForm((current) => ({
																	...current,
																	statusId: value,
																}))
															}
															disabled={
																subtaskWorkflowLoading ||
																createTask.isPending ||
																createSubtask.isPending
															}
														>
															<SelectTrigger className="mt-2">
																<SelectValue
																	placeholder={
																		subtaskWorkflowLoading
																			? "Loading..."
																			: "Select status"
																	}
																>
																	{subtaskForm.statusId &&
																		subtaskStatusMap.get(
																			subtaskForm.statusId,
																		) && (
																			<div className="flex items-center gap-2">
																				<div
																					className="h-2 w-2 rounded-full shrink-0"
																					style={{
																						backgroundColor:
																							subtaskStatusMap.get(
																								subtaskForm.statusId,
																							)?.colorCode,
																					}}
																				/>
																				<span>
																					{
																						subtaskStatusMap.get(
																							subtaskForm.statusId,
																						)?.name
																					}
																				</span>
																			</div>
																		)}
																</SelectValue>
															</SelectTrigger>
															<SelectContent>
																{subtaskStatusOptions.map((status) => (
																	<SelectItem
																		key={status.id}
																		value={status.id}
																	>
																		<div className="flex items-center gap-2">
																			<div
																				className="h-2 w-2 rounded-full shrink-0"
																				style={{
																					backgroundColor: status.colorCode,
																				}}
																			/>
																			<span>{status.name}</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<p className="text-sm text-muted-foreground py-2">
															No workflow
														</p>
													)}
												</div>
											</div>

											<div>
												<Label>Assignee</Label>
												<Select
													value={subtaskForm.assignedTo}
													onValueChange={(value) =>
														setSubtaskForm((current) => ({
															...current,
															assignedTo: value || "",
														}))
													}
													disabled={
														createTask.isPending || createSubtask.isPending
													}
												>
													<SelectTrigger className="mt-2">
														<SelectValue placeholder="Unassigned" />
													</SelectTrigger>
													<SelectContent>
														{(() => {
															const userMembers = projectMembers.filter(
																(m) => m.userId !== null,
															);
															const ownerId = project?.ownerId;
															const allUserIds = new Set<string>();
															if (ownerId) {
																allUserIds.add(ownerId);
															}
															userMembers.forEach((member) => {
																if (member.userId) {
																	allUserIds.add(member.userId);
																}
															});
															const assigneeOptions = Array.from(
																allUserIds,
															).sort((a, b) => {
																if (a === ownerId) return -1;
																if (b === ownerId) return 1;
																return 0;
															});

															return assigneeOptions.map((userId) => (
																<SelectItem
																	key={userId}
																	value={userId}
																>
																	<AssigneeDisplay userId={userId} />
																</SelectItem>
															));
														})()}
													</SelectContent>
												</Select>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<Label>Start Date</Label>
													<div className="mt-2">
														<DatePicker
															value={subtaskForm.startDate}
															onChange={(value) =>
																setSubtaskForm((current) => ({
																	...current,
																	startDate: value ?? "",
																}))
															}
															max={subtaskForm.dueDate || undefined}
														/>
													</div>
												</div>
												<div>
													<Label>Due Date</Label>
													<div className="mt-2">
														<DatePicker
															value={subtaskForm.dueDate}
															onChange={(value) =>
																setSubtaskForm((current) => ({
																	...current,
																	dueDate: value ?? "",
																}))
															}
															min={subtaskForm.startDate || undefined}
														/>
													</div>
												</div>
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={handleClearSubtaskForm}
												disabled={
													createTask.isPending || createSubtask.isPending
												}
												className="flex-1"
											>
												<X className="size-4 mr-2" />
												Clear
											</Button>
											<Button
												type="button"
												onClick={handleAddSubtask}
												disabled={
													!subtaskForm.title.trim() ||
													createTask.isPending ||
													createSubtask.isPending
												}
												className="flex-1"
											>
												<Plus className="size-4 mr-2" />
												Add
											</Button>
										</div>
									</div>
								</div>
							)}
						</div>

						<DialogFooter className="mt-6 pt-4 border-t border-border shrink-0">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancelClick}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									!canSubmit || createTask.isPending || createSubtask.isPending
								}
							>
								{createTask.isPending || createSubtask.isPending
									? "Creating..."
									: "Create Task"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Confirmation Dialog */}
			<Dialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Discard changes?</DialogTitle>
						<DialogDescription>
							You have unsaved changes. Are you sure you want to discard them
							and close the dialog?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleCancelDiscard}
						>
							Keep editing
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirmDiscard}
						>
							Discard changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
