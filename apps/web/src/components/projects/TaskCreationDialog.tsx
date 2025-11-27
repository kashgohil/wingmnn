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
import { useCreateSubtask } from "@/lib/hooks/use-subtasks";
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { useWorkflow, useWorkflows } from "@/lib/hooks/use-workflows";
import {
	getPriorityLabel,
	PRIORITY_META,
	PRIORITY_ORDER,
} from "@/lib/priority";
import { isRichTextEmpty } from "@/lib/rich-text";
import { toast } from "@/lib/toast";
import { useForm } from "@tanstack/react-form";
import { catchError } from "@wingmnn/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "../rich-text/RichTextEditor";
import { Button } from "../ui/button";
import { PriorityIcon, PriorityLabel } from "./PriorityLabel";

type SubtaskDraft = {
	title: string;
	description: string;
	priority: NonNullable<Task["priority"]>;
	statusId: string;
	startDate: string;
	dueDate: string;
};

function getDefaultSubtaskDraft(initialStatusId?: string): SubtaskDraft {
	return {
		title: "",
		description: "",
		priority: "medium",
		statusId: initialStatusId ?? "",
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
	startDate: string;
	dueDate: string;
	estimatedHours: string;
	estimatedPoints: string;
};

function getDefaultTaskCreationValues(): TaskCreationFormValues {
	return {
		title: "",
		description: "",
		priority: "medium",
		statusId: "",
		startDate: "",
		dueDate: "",
		estimatedHours: "",
		estimatedPoints: "",
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
	const subtaskStatusOptions = useMemo<WorkflowStatus[]>(() => {
		if (!subtaskWorkflow?.statuses?.length) {
			return [];
		}
		return [...subtaskWorkflow.statuses].sort(
			(a, b) => a.position - b.position,
		);
	}, [subtaskWorkflow?.statuses]);
	const subtaskStatusLabelMap = useMemo(() => {
		return subtaskStatusOptions.reduce<Record<string, string>>(
			(acc, status) => {
				acc[status.id] = status.name;
				return acc;
			},
			{},
		);
	}, [subtaskStatusOptions]);
	const [subtaskForm, setSubtaskForm] = useState<SubtaskDraft>(() =>
		getDefaultSubtaskDraft(),
	);
	const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);
	const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
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

	const resetForm = useCallback(() => {
		form.reset(getDefaultTaskCreationValues());
		setSubtasks([]);
		setSubtaskForm(getDefaultSubtaskDraft(subtaskStatusOptions[0]?.id));
		setIsSubtaskFormOpen(false);
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

	const handleToggleSubtaskForm = () => {
		if (isSubtaskFormOpen) {
			setSubtaskForm(getDefaultSubtaskDraft(subtaskStatusOptions[0]?.id));
		}
		setIsSubtaskFormOpen((current) => !current);
	};

	const handleCancelSubtaskForm = () => {
		setIsSubtaskFormOpen(false);
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
				<DialogContent className="sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create Task</DialogTitle>
						<DialogDescription>
							Add a new task to {projectName ?? "this project"}.
						</DialogDescription>
					</DialogHeader>

					<form
						className="space-y-6"
						noValidate
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-5 md:flex-row">
								<div className="space-y-5 md:flex-4">
									<div className="space-y-2">
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
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label htmlFor="task-description">Description</Label>
										<form.Field name="description">
											{(field) => (
												<RichTextEditor
													id="task-description"
													value={field.state.value}
													onChange={field.handleChange}
													containerClassName="bg-transparent"
													contentClassName="bg-transparent"
													placeholderClassName="text-muted-foreground/70"
													toolbarClassName="bg-transparent"
													placeholder="Add helpful context (optional)"
												/>
											)}
										</form.Field>
									</div>
								</div>

								<div className="space-y-5 md:flex-1">
									<div className="space-y-2">
										<Label htmlFor="task-priority">Priority</Label>
										<form.Field name="priority">
											{(field) => (
												<Select
													value={field.state.value}
													onValueChange={(
														value: NonNullable<Task["priority"]>,
													) => field.handleChange(value)}
												>
													<SelectTrigger id="task-priority">
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

									<div className="space-y-2">
										<Label>Status</Label>
										{workflowId ? (
											<form.Field name="statusId">
												{(field) => (
													<Select
														value={field.state.value}
														onValueChange={(value) => field.handleChange(value)}
														disabled={
															!statusOptions.length ||
															createTask.isPending ||
															workflowLoading
														}
													>
														<SelectTrigger>
															<SelectValue
																placeholder={
																	workflowLoading
																		? "Loading statuses..."
																		: statusOptions.length
																		? "Select status"
																		: "No statuses available"
																}
															/>
														</SelectTrigger>
														<SelectContent>
															{statusOptions.map((status) => (
																<SelectItem
																	key={status.id}
																	value={status.id}
																>
																	{status.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											</form.Field>
										) : (
											<p className="text-sm text-muted-foreground">
												Assign this project to a workflow to enable status
												tracking.
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label>Start Date</Label>
										<form.Field name="startDate">
											{(field) => (
												<DatePicker
													value={field.state.value}
													onChange={(value) => field.handleChange(value || "")}
													max={form.state.values.dueDate || undefined}
													placeholder="Select start date"
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label>Due Date</Label>
										<form.Field name="dueDate">
											{(field) => (
												<DatePicker
													value={field.state.value}
													onChange={(value) => field.handleChange(value || "")}
													min={form.state.values.startDate || undefined}
													placeholder="Select due date"
												/>
											)}
										</form.Field>
									</div>

									<div className="space-y-2">
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
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
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
												/>
											)}
										</form.Field>
									</div>
								</div>

								{/* <div className="flex flex-col gap-2 rounded-none border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
								<p className="font-semibold text-foreground">Tips</p>
								<ul className="list-disc pl-4 space-y-1">
									<li>Use concise titles so tasks stay scannable.</li>
									<li>Priorities help teammates understand urgency.</li>
									<li>
										Dates unlock the timeline, calendar, and analytics views.
									</li>
								</ul>
							</div> */}
							</div>

							{subtasks.length > 0 && (
								<div className="rounded-none border-2 border-border retro-border-shadow-sm p-4">
									<div className="space-y-3">
										<p className="text-sm font-bold text-foreground">
											Queued subtasks ({subtasks.length})
										</p>
										<ul className="space-y-2">
											{subtasks.map((subtask, index) => (
												<li
													key={`${subtask.title}-${index}`}
													className="border-2 border-border retro-border-shadow-sm p-3 text-sm"
												>
													<div className="flex items-start justify-between gap-2">
														<div className="space-y-1">
															<p className="font-bold text-foreground">
																{subtask.title}
															</p>
															<p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
																<span className="inline-flex items-center gap-1.5">
																	Priority:
																	<span className="inline-flex items-center gap-1.5">
																		<PriorityIcon
																			priority={subtask.priority}
																			className="size-3.5"
																		/>
																		{getPriorityLabel(subtask.priority)}
																	</span>
																</span>
																<span className="inline-flex items-center gap-1.5">
																	• Status:
																	{subtaskStatusLabelMap[subtask.statusId] ??
																		"Auto"}
																</span>
															</p>
															{subtask.startDate || subtask.dueDate ? (
																<p className="text-xs text-muted-foreground">
																	{subtask.startDate
																		? `Start: ${subtask.startDate}`
																		: ""}
																	{subtask.startDate && subtask.dueDate
																		? " • "
																		: ""}
																	{subtask.dueDate
																		? `Due: ${subtask.dueDate}`
																		: ""}
																</p>
															) : null}
														</div>
														<Button
															type="button"
															size="sm"
															variant="ghost"
															onClick={() => handleRemoveSubtask(index)}
															disabled={
																createTask.isPending || createSubtask.isPending
															}
														>
															Remove
														</Button>
													</div>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}

							<div className="mt-6 space-y-5 lg:mt-0 lg:sticky lg:top-6">
								<div className="border-2 border-border retro-border-shadow-sm p-4">
									<div className="space-y-4">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div>
												<p className="text-base font-bold text-foreground">
													Create Subtasks
												</p>
												<p className="text-sm text-muted-foreground">
													Plan the smaller deliverables that make up this task.
													Each subtask can have its own status, priority, and
													timeline.
												</p>
											</div>
											<Button
												type="button"
												variant={isSubtaskFormOpen ? "ghost" : "default"}
												onClick={handleToggleSubtaskForm}
												disabled={
													createTask.isPending || createSubtask.isPending
												}
											>
												{isSubtaskFormOpen ? "Hide" : "Add subtask"}
											</Button>
										</div>

										{isSubtaskFormOpen ? (
											<div className="space-y-5">
												<div className="flex flex-col gap-5 md:flex-row">
													<div className="space-y-4 md:flex-4">
														<div className="space-y-2">
															<Label htmlFor="subtask-title">Title</Label>
															<Input
																id="subtask-title"
																value={subtaskForm.title}
																onChange={(event) =>
																	setSubtaskForm((current) => ({
																		...current,
																		title: event.target.value,
																	}))
																}
																placeholder="Describe what needs to get done"
																disabled={
																	createTask.isPending ||
																	createSubtask.isPending
																}
															/>
														</div>

														<div className="space-y-2">
															<Label htmlFor="subtask-description">
																Description
															</Label>
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
																contentClassName="bg-transparent min-h-[130px]"
																placeholderClassName="text-muted-foreground/70"
																toolbarClassName="bg-transparent"
																placeholder="Optional details, links, or checklists"
															/>
														</div>
													</div>

													<div className="space-y-4 md:flex-1">
														<div className="space-y-2">
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
																	createTask.isPending ||
																	createSubtask.isPending
																}
															>
																<SelectTrigger>
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
														</div>

														<div className="space-y-2">
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
																	<SelectTrigger>
																		<SelectValue
																			placeholder={
																				subtaskWorkflowLoading
																					? "Loading statuses..."
																					: "Select status"
																			}
																		/>
																	</SelectTrigger>
																	<SelectContent>
																		{subtaskStatusOptions.map((status) => (
																			<SelectItem
																				key={status.id}
																				value={status.id}
																			>
																				{status.name}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															) : (
																<p className="text-sm text-muted-foreground">
																	No subtask workflow is available yet. Create
																	one to manage statuses.
																</p>
															)}
														</div>

														<div className="space-y-2">
															<Label>Start Date</Label>
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
														<div className="space-y-2">
															<Label>Due Date</Label>
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

												<div className="flex justify-end gap-2">
													<Button
														type="button"
														variant="ghost"
														onClick={handleCancelSubtaskForm}
														disabled={
															createTask.isPending || createSubtask.isPending
														}
													>
														Cancel
													</Button>
													<Button
														type="button"
														onClick={handleAddSubtask}
														disabled={
															!subtaskForm.title.trim() ||
															createTask.isPending ||
															createSubtask.isPending
														}
													>
														Add to queue
													</Button>
												</div>
											</div>
										) : null}
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-2">
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
						</div>
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
