/**
 * Project Creation Dialog Component
 * Multi-step dialog for creating a new project
 */

import { addProjectMember } from "@/lib/api/projects.api";
import { useAuth } from "@/lib/auth/auth-context";
import { useCreateProject } from "@/lib/hooks/use-projects";
import { useWorkflows } from "@/lib/hooks/use-workflows";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Stepper } from "../ui/stepper";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface ProjectCreationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ProjectMember {
	type: "user" | "group";
	id: string;
	name: string;
}

export function ProjectCreationDialog({
	open,
	onOpenChange,
}: ProjectCreationDialogProps) {
	const [step, setStep] = useState(1);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [workflowId, setWorkflowId] = useState<string>("");
	const [key, setKey] = useState("");
	const [members, setMembers] = useState<ProjectMember[]>([]);
	const [selectedView, setSelectedView] = useState<string>("board");
	const [projectStatus, setProjectStatus] = useState<string>("active");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [priority, setPriority] = useState<string>("medium");
	const [category, setCategory] = useState<string>("");
	const [enableTimeTracking, setEnableTimeTracking] = useState<boolean>(true);
	const [enableNotifications, setEnableNotifications] = useState<boolean>(true);

	const { data: workflows = [] } = useWorkflows({ type: "task" });
	const createProject = useCreateProject();
	const { user } = useAuth();

	const resetForm = () => {
		setStep(1);
		setName("");
		setDescription("");
		setWorkflowId("");
		setKey("");
		setMembers([]);
		setSelectedView("board");
		setProjectStatus("active");
		setStartDate("");
		setEndDate("");
		setPriority("medium");
		setCategory("");
		setEnableTimeTracking(true);
		setEnableNotifications(true);
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

	const canProceedStep1 = name.trim().length > 0;
	const canProceedStep2 = workflowId.length > 0;
	const canSubmit = canProceedStep1 && canProceedStep2;

	const handleSubmit = async () => {
		if (!canSubmit || !user) return;

		try {
			// Build settings object
			const settings: {
				enableTimeTracking?: boolean;
				enableNotifications?: boolean;
				selectedView?: string;
			} = {};

			if (enableTimeTracking !== undefined) {
				settings.enableTimeTracking = enableTimeTracking;
			}
			if (enableNotifications !== undefined) {
				settings.enableNotifications = enableNotifications;
			}
			if (selectedView) {
				settings.selectedView = selectedView;
			}

			// Create the project with all configuration
			const project = await createProject.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,
				workflowId,
				status:
					projectStatus !== "active"
						? (projectStatus as "archived" | "on_hold" | "completed")
						: undefined,
				key: key.trim() || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				priority:
					priority !== "medium"
						? (priority as "low" | "high" | "critical")
						: undefined,
				category: category.trim() || undefined,
				settings: Object.keys(settings).length > 0 ? settings : undefined,
			});

			if (!project) {
				throw new Error("Failed to create project");
			}

			// Add members if any were selected
			if (members.length > 0) {
				for (const member of members) {
					try {
						await addProjectMember(project.id, {
							userId: member.type === "user" ? member.id : undefined,
							userGroupId: member.type === "group" ? member.id : undefined,
						});
					} catch (error) {
						console.error(`Error adding member ${member.name}:`, error);
					}
				}
			}

			resetForm();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to create project:", error);
			// Error handling could be improved with a toast notification
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
									<Input
										id="project-name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Enter project name"
										className="mt-2"
									/>
								</div>

								<div>
									<Label htmlFor="project-description">Description</Label>
									<Textarea
										id="project-description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Enter project description (optional)"
										rows={4}
										className="mt-2"
									/>
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
									<div className="space-y-2 max-h-96 overflow-y-auto">
										{workflows.map((workflow) => (
											<div
												key={workflow.id}
												className={`p-4 retro-border rounded-none cursor-pointer transition-colors ${
													workflowId === workflow.id
														? "bg-primary text-primary-foreground"
														: "hover:bg-accent"
												}`}
												onClick={() => setWorkflowId(workflow.id)}
											>
												<div className="font-medium">{workflow.name}</div>
												{workflow.description && (
													<div className="text-sm opacity-80 mt-1">
														{workflow.description}
													</div>
												)}
												{workflow.statuses && workflow.statuses.length > 0 && (
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
										))}
									</div>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-6">
								{/* Project Status */}
								<div>
									<Label htmlFor="project-status">Initial Status</Label>
									<Select
										value={projectStatus}
										onValueChange={setProjectStatus}
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
									<p className="text-xs text-muted-foreground mt-1">
										Set the initial status for this project
									</p>
								</div>

								{/* Project Dates */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="start-date">Start Date</Label>
										<div className="mt-2">
											<DatePicker
												value={startDate}
												onChange={setStartDate}
												placeholder="Select start date"
												max={endDate || undefined}
											/>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											Project start date (optional)
										</p>
									</div>
									<div>
										<Label htmlFor="end-date">End Date</Label>
										<div className="mt-2">
											<DatePicker
												value={endDate}
												onChange={setEndDate}
												placeholder="Select end date"
												min={startDate || undefined}
											/>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											Project end date (optional)
										</p>
									</div>
								</div>

								{/* Priority and Category */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="priority">Priority</Label>
										<Select
											value={priority}
											onValueChange={setPriority}
										>
											<SelectTrigger
												id="priority"
												className="mt-2"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Low</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="high">High</SelectItem>
												<SelectItem value="critical">Critical</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground mt-1">
											Project priority level
										</p>
									</div>
									<div>
										<Label htmlFor="category">Category</Label>
										<Input
											id="category"
											value={category}
											onChange={(e) => setCategory(e.target.value)}
											placeholder="e.g., Development, Marketing"
											className="mt-2"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Project category or type (optional)
										</p>
									</div>
								</div>

								{/* Task Key Prefix */}
								<div>
									<Label htmlFor="key">Task Key Prefix</Label>
									<Input
										id="key"
										value={key}
										onChange={(e) => {
											const value = e.target.value
												.toUpperCase()
												.replace(/[^A-Z]/g, "")
												.slice(0, 3);
											setKey(value);
										}}
										placeholder="ABC"
										maxLength={3}
										className="mt-2 w-24"
									/>
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
										<Switch
											id="time-tracking"
											checked={enableTimeTracking}
											onCheckedChange={setEnableTimeTracking}
										/>
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
										<Switch
											id="notifications"
											checked={enableNotifications}
											onCheckedChange={setEnableNotifications}
										/>
									</div>
								</div>

								{/* Default View */}
								<div>
									<Label htmlFor="default-view">Default View</Label>
									<Select
										value={selectedView}
										onValueChange={setSelectedView}
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
											<SelectItem value="timeline">Timeline View</SelectItem>
											<SelectItem value="calendar">Calendar View</SelectItem>
										</SelectContent>
									</Select>
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
								onClick={handleSubmit}
								disabled={!canSubmit || createProject.isPending}
							>
								{createProject.isPending ? "Creating..." : "Create Project"}
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
