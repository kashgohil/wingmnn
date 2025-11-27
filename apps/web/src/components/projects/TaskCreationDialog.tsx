import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { useWorkflow } from "@/lib/hooks/use-workflows";
import { isRichTextEmpty } from "@/lib/rich-text";
import { toast } from "@/lib/toast";
import { useForm } from "@tanstack/react-form";
import { catchError } from "@wingmnn/utils";
import { useCallback, useEffect, useMemo } from "react";
import { RichTextEditor } from "../rich-text/RichTextEditor";
import { Button } from "../ui/button";

const PRIORITY_OPTIONS: Array<{
	value: NonNullable<Task["priority"]>;
	label: string;
	description: string;
}> = [
	{ value: "critical", label: "Critical", description: "Highest urgency" },
	{ value: "high", label: "High", description: "Needs attention soon" },
	{ value: "medium", label: "Medium", description: "Standard priority" },
	{ value: "low", label: "Low", description: "Nice to have" },
];

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
	const { data: workflow, isLoading: workflowLoading } = useWorkflow(
		workflowId ?? null,
	);
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

			toast.success("Task created", {
				description: `"${task.title}" has been added to ${
					projectName ?? "this project"
				}.`,
			});
			resetForm();
			handleClose(false);
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
	}, [form]);

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

	const handleClose = (nextOpen: boolean) => {
		if (!nextOpen) {
			resetForm();
		}
		onOpenChange(nextOpen);
	};

	const canSubmit = Boolean(
		projectId && form.state.values.title.trim().length > 0,
	);

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
		>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Create Task</DialogTitle>
					<DialogDescription>
						Add a new task to {projectName ?? "this project"}.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-5"
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="space-y-2">
						<Label htmlFor="task-title">Title *</Label>
						<form.Field name="title">
							{(field) => (
								<Input
									id="task-title"
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
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

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="task-priority">Priority</Label>
							<form.Field name="priority">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value: NonNullable<Task["priority"]>) =>
											field.handleChange(value)
										}
									>
										<SelectTrigger id="task-priority">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PRIORITY_OPTIONS.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}
												>
													{option.label}
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
									Assign this project to a workflow to enable status tracking.
								</p>
							)}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
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
					</div>

					<div className="grid gap-4 md:grid-cols-2">
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
										onChange={(event) => field.handleChange(event.target.value)}
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
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="e.g. 5"
									/>
								)}
							</form.Field>
						</div>
					</div>

					<div className="flex flex-col gap-2 rounded-none border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
						<p className="font-semibold text-foreground">Tips</p>
						<ul className="list-disc pl-4 space-y-1">
							<li>Use concise titles so tasks stay scannable.</li>
							<li>Priorities help teammates understand urgency.</li>
							<li>Dates unlock the timeline, calendar, and analytics views.</li>
						</ul>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleClose(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!canSubmit || createTask.isPending}
						>
							{createTask.isPending ? "Creating..." : "Create Task"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
