/**
 * Project Creation Dialog Component
 * Multi-step dialog for creating a new project
 */

import { Button } from "@/components/ui/button";
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
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { addProjectMembersBulk } from "@/lib/api/projects.api";
import { useAuth } from "@/lib/auth/auth-context";
import { useCreateProject } from "@/lib/hooks/use-projects";
import { useWorkflows } from "@/lib/hooks/use-workflows";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/priority";
import { toast } from "@/lib/toast";
import { useForm } from "@tanstack/react-form";
import { catchError } from "@wingmnn/utils";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { PriorityIcon, PriorityLabel } from "./PriorityLabel";

interface ProjectCreationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ProjectMember {
	type: "user" | "group";
	id: string;
	name: string;
}

type ProjectCreationFormValues = {
	name: string;
	description: string;
	workflowId: string;
	key: string;
	selectedView: string;
	projectStatus: "active" | "on_hold" | "completed" | "archived";
	startDate: string;
	endDate: string;
	priority: "low" | "medium" | "high" | "critical";
	category: string;
	enableTimeTracking: boolean;
	enableNotifications: boolean;
};

function getDefaultProjectCreationValues(): ProjectCreationFormValues {
	return {
		name: "",
		description: "",
		workflowId: "",
		key: "",
		selectedView: "board",
		projectStatus: "active",
		startDate: "",
		endDate: "",
		priority: "medium",
		category: "",
		enableTimeTracking: true,
		enableNotifications: true,
	};
}

const PROJECT_PRIORITY_OPTIONS = PRIORITY_ORDER.map((priority) => ({
	value: priority,
	label: PRIORITY_META[priority].label,
}));

export function ProjectCreationDialog({
	open,
	onOpenChange,
}: ProjectCreationDialogProps) {
	const [step, setStep] = useState(1);
	const [members, setMembers] = useState<ProjectMember[]>([]);

	const { data: workflows = [] } = useWorkflows({ type: "task" });
	const createProject = useCreateProject();
	const { user } = useAuth();

	const form = useForm({
		defaultValues: getDefaultProjectCreationValues(),
		onSubmit: async ({ value }) => {
			if (!user) {
				return;
			}

			const settings: {
				enableTimeTracking?: boolean;
				enableNotifications?: boolean;
				selectedView?: string;
			} = {};

			if (typeof value.enableTimeTracking === "boolean") {
				settings.enableTimeTracking = value.enableTimeTracking;
			}

			if (typeof value.enableNotifications === "boolean") {
				settings.enableNotifications = value.enableNotifications;
			}

			if (value.selectedView) {
				settings.selectedView = value.selectedView;
			}

			const statusParam =
				value.projectStatus !== "active"
					? (value.projectStatus as "archived" | "on_hold" | "completed")
					: undefined;

			const priorityParam =
				value.priority !== "medium"
					? (value.priority as "low" | "high" | "critical")
					: undefined;

			const [project, error] = await catchError(
				createProject.mutateAsync({
					name: value.name.trim(),
					description: value.description.trim() || undefined,
					workflowId: value.workflowId,
					status: statusParam,
					key: value.key.trim() || undefined,
					startDate: value.startDate || undefined,
					endDate: value.endDate || undefined,
					priority: priorityParam,
					category: value.category.trim() || undefined,
					settings: Object.keys(settings).length > 0 ? settings : undefined,
				}),
			);

			if (error || !project) {
				toast.error("Failed to create project", {
					description:
						error?.message || "Failed to create project. Please try again.",
				});
				return;
			}

			if (members.length > 0) {
				const payload = members.map((member) =>
					member.type === "user"
						? { userId: member.id }
						: { userGroupId: member.id },
				);

				const [, memberError] = await catchError(
					addProjectMembersBulk(project.id, payload),
				);

				if (memberError) {
					console.error("Error adding project members:", memberError);
				}
			}

			resetForm();
			onOpenChange(false);
			toast.success("Project created successfully", {
				description: `"${value.name.trim()}" has been created and is ready to use.`,
			});
		},
	});

	const resetForm = () => {
		setStep(1);
		setMembers([]);
		form.reset(getDefaultProjectCreationValues());
	};

	const handleClose = (open: boolean) => {
		if (!open) {
			resetForm();
		}
		onOpenChange(open);
	};

	const handleNext = () => {
		if (step < 3) {
			setStep(step + 1);
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(step - 1);
		}
	};

	const stepNames = ["Basic Details", "Workflow Selection", "Configuration"];

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
		>
			<DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
					<DialogDescription>
						Set up your project in three simple steps
					</DialogDescription>
				</DialogHeader>

				<Stepper
					currentStep={step}
					steps={stepNames}
					mode="mobile"
				/>

				<div className="flex gap-6 mt-6 flex-1 min-h-0">
					<Stepper
						currentStep={step}
						steps={stepNames}
						mode="desktop"
					/>

					{/* Separator */}
					<div className="hidden md:block w-px bg-border" />

					{/* Step Content */}
					<div className="flex-1 overflow-y-auto min-h-[500px] max-h-[500px]">
						{step === 1 && (
							<div className="space-y-6">
								<div>
									<Label htmlFor="project-name">Project Name *</Label>
									<form.Field name="name">
										{(field) => (
											<Input
												id="project-name"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Enter project name"
												className="mt-2"
											/>
										)}
									</form.Field>
								</div>

								<div>
									<Label htmlFor="project-description">Description</Label>
									<form.Field name="description">
										{(field) => (
											<Textarea
												id="project-description"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Enter project description (optional)"
												rows={4}
												className="mt-2"
											/>
										)}
									</form.Field>
								</div>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-6">
								<div>
									<Label>Select Workflow</Label>
									<p className="text-sm text-muted-foreground mb-4">
										Choose the workflow for this project. You can change this
										later in project settings.
									</p>
									<form.Field name="workflowId">
										{(field) => (
											<div className="space-y-2 max-h-96 overflow-y-auto">
												{workflows.map((workflow) => {
													const isSelected = field.state.value === workflow.id;
													return (
														<div
															key={workflow.id}
															className={`p-4 retro-border rounded-none cursor-pointer transition-colors ${
																isSelected
																	? "bg-primary text-primary-foreground"
																	: "hover:bg-accent"
															}`}
															onClick={() => field.handleChange(workflow.id)}
														>
															<div className="font-medium">{workflow.name}</div>
															{workflow.description && (
																<div className="text-sm opacity-80 mt-1">
																	{workflow.description}
																</div>
															)}
															{workflow.statuses &&
																workflow.statuses.length > 0 && (
																	<div className="flex gap-2 mt-2 flex-wrap">
																		{workflow.statuses.map((status) => (
																			<span
																				key={status.id}
																				className="text-xs px-2 py-1 retro-border rounded-none"
																				style={{
																					borderColor: status.colorCode,
																					backgroundColor: `${status.colorCode}20`,
																				}}
																			>
																				{status.name}
																			</span>
																		))}
																	</div>
																)}
														</div>
													);
												})}
											</div>
										)}
									</form.Field>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-6">
								{/* Project Status */}
								<div>
									<Label htmlFor="project-status">Initial Status</Label>
									<form.Field name="projectStatus">
										{(field) => (
											<Select
												value={field.state.value}
												onValueChange={(
													value: ProjectCreationFormValues["projectStatus"],
												) => field.handleChange(value)}
											>
												<SelectTrigger
													id="project-status"
													className="mt-2"
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="active">Active</SelectItem>
													<SelectItem value="on_hold">On Hold</SelectItem>
													<SelectItem value="completed">Completed</SelectItem>
													<SelectItem value="archived">Archived</SelectItem>
												</SelectContent>
											</Select>
										)}
									</form.Field>
									<p className="text-xs text-muted-foreground mt-1">
										Set the initial status for this project
									</p>
								</div>

								{/* Project Dates */}
								<form.Subscribe
									selector={(state) => ({
										startDate: state.values.startDate,
										endDate: state.values.endDate,
									})}
								>
									{({ startDate, endDate }) => (
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="start-date">Start Date</Label>
												<div className="mt-2">
													<form.Field name="startDate">
														{(field) => (
															<DatePicker
																value={field.state.value}
																onChange={(value) => field.handleChange(value)}
																placeholder="Select start date"
																max={endDate || undefined}
															/>
														)}
													</form.Field>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													Project start date (optional)
												</p>
											</div>
											<div>
												<Label htmlFor="end-date">End Date</Label>
												<div className="mt-2">
													<form.Field name="endDate">
														{(field) => (
															<DatePicker
																value={field.state.value}
																onChange={(value) => field.handleChange(value)}
																placeholder="Select end date"
																min={startDate || undefined}
															/>
														)}
													</form.Field>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													Project end date (optional)
												</p>
											</div>
										</div>
									)}
								</form.Subscribe>

								{/* Priority and Category */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="priority">Priority</Label>
										<form.Field name="priority">
											{(field) => (
												<Select
													value={field.state.value}
													onValueChange={(
														value: ProjectCreationFormValues["priority"],
													) => field.handleChange(value)}
												>
													<SelectTrigger
														id="priority"
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
														{PROJECT_PRIORITY_OPTIONS.map((option) => (
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
											)}
										</form.Field>
										<p className="text-xs text-muted-foreground mt-1">
											Project priority level
										</p>
									</div>
									<div>
										<Label htmlFor="category">Category</Label>
										<form.Field name="category">
											{(field) => (
												<Input
													id="category"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="e.g., Development, Marketing"
													className="mt-2"
												/>
											)}
										</form.Field>
										<p className="text-xs text-muted-foreground mt-1">
											Project category or type (optional)
										</p>
									</div>
								</div>

								{/* Task Key Prefix */}
								<div>
									<Label htmlFor="key">Task Key Prefix</Label>
									<form.Field name="key">
										{(field) => (
											<Input
												id="key"
												value={field.state.value}
												onChange={(e) => {
													const value = e.target.value
														.toUpperCase()
														.replace(/[^A-Z]/g, "")
														.slice(0, 3);
													field.handleChange(value);
												}}
												placeholder="ABC"
												maxLength={3}
												className="mt-2 w-24"
											/>
										)}
									</form.Field>
									<p className="text-xs text-muted-foreground mt-1">
										Three-letter prefix for task and subtask IDs (e.g., ABC-001)
									</p>
								</div>

								{/* Feature Toggles */}
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 retro-border rounded-none">
										<div className="flex-1">
											<Label
												htmlFor="time-tracking"
												className="font-medium"
											>
												Enable Time Tracking
											</Label>
											<p className="text-sm text-muted-foreground mt-1">
												Allow team members to track time spent on tasks
											</p>
										</div>
										<form.Field name="enableTimeTracking">
											{(field) => (
												<Switch
													id="time-tracking"
													checked={field.state.value}
													onCheckedChange={(checked) =>
														field.handleChange(Boolean(checked))
													}
												/>
											)}
										</form.Field>
									</div>
									<div className="flex items-center justify-between p-4 retro-border rounded-none">
										<div className="flex-1">
											<Label
												htmlFor="notifications"
												className="font-medium"
											>
												Enable Notifications
											</Label>
											<p className="text-sm text-muted-foreground mt-1">
												Send notifications for project updates and changes
											</p>
										</div>
										<form.Field name="enableNotifications">
											{(field) => (
												<Switch
													id="notifications"
													checked={field.state.value}
													onCheckedChange={(checked) =>
														field.handleChange(Boolean(checked))
													}
												/>
											)}
										</form.Field>
									</div>
								</div>

								{/* Default View */}
								<div>
									<Label htmlFor="default-view">Default View</Label>
									<form.Field name="selectedView">
										{(field) => (
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger
													id="default-view"
													className="mt-2"
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="board">Board View</SelectItem>
													<SelectItem value="list">List View</SelectItem>
													<SelectItem value="timeline">
														Timeline View
													</SelectItem>
													<SelectItem value="calendar">
														Calendar View
													</SelectItem>
												</SelectContent>
											</Select>
										)}
									</form.Field>
									<p className="text-xs text-muted-foreground mt-1">
										Choose the default view for this project
									</p>
								</div>

								{/* Members */}
								<div>
									<Label>Project Members</Label>
									<p className="text-sm text-muted-foreground mb-4">
										Add team members to this project. You can add more later.
									</p>
									<div className="space-y-2">
										{members.map((member, index) => (
											<div
												key={`${member.type}-${member.id}-${index}`}
												className="flex items-center justify-between p-3 retro-border rounded-none"
											>
												<div>
													<span className="font-medium">{member.name}</span>
													<span className="text-xs text-muted-foreground ml-2">
														({member.type === "user" ? "User" : "Group"})
													</span>
												</div>
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={() => {
														setMembers(members.filter((_, i) => i !== index));
													}}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											onClick={() => {
												// Placeholder for member selection
												// In a real implementation, this would open a user/group picker
												alert(
													"Member selection will be implemented with a user/group picker",
												);
											}}
											className="w-full"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Member
										</Button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Navigation Buttons */}
				<form.Subscribe
					selector={(state) => ({
						canProceedStep1: state.values.name.trim().length > 0,
						canProceedStep2: state.values.workflowId.trim().length > 0,
					})}
				>
					{({ canProceedStep1, canProceedStep2 }) => {
						const canSubmit = canProceedStep1 && canProceedStep2;
						return (
							<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
								<Button
									variant="outline"
									onClick={handleBack}
									disabled={step === 1}
								>
									<ChevronLeft className="h-4 w-4 mr-2" />
									Back
								</Button>

								<div className="flex gap-2">
									{step < 3 ? (
										<Button
											onClick={handleNext}
											disabled={
												(step === 1 && !canProceedStep1) ||
												(step === 2 && !canProceedStep2)
											}
										>
											Next
											<ChevronRight className="h-4 w-4 ml-2" />
										</Button>
									) : (
										<Button
											type="button"
											onClick={() => {
												void form.handleSubmit();
											}}
											disabled={!canSubmit || createProject.isPending}
										>
											{createProject.isPending
												? "Creating..."
												: "Create Project"}
										</Button>
									)}
								</div>
							</div>
						);
					}}
				</form.Subscribe>
			</DialogContent>
		</Dialog>
	);
}
