/**
 * Project Settings Dialog Component
 * Allows owners to edit project configurations and members to view them
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
import { Switch } from "@/components/ui/switch";
import { type Project } from "@/lib/api/projects.api";
import {
	useUpdateProject,
	useUpdateProjectStatus,
} from "@/lib/hooks/use-projects";
import { toast } from "@/lib/toast";
import { Plus, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

interface ProjectMember {
	type: "user" | "group";
	id: string;
	name: string;
}

interface ProjectSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project?: Project | null;
	loading: boolean;
	isOwner: boolean;
}

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

const PROJECT_VIEW_LABELS: Record<string, string> = {
	board: "Board View",
	list: "List View",
	timeline: "Timeline View",
	calendar: "Calendar View",
};

const PRIORITY_LABELS: Record<NonNullable<Project["priority"]>, string> = {
	low: "Low",
	medium: "Medium",
	high: "High",
	critical: "Critical",
};

function Detail({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="space-y-1">
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<div className="text-sm font-medium text-foreground leading-relaxed">
				{value}
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

function getProjectViewLabel(view?: string | null) {
	if (!view) {
		return "Overview";
	}
	return PROJECT_VIEW_LABELS[view] ?? view;
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

function getPriorityLabel(priority: Project["priority"] | null | undefined) {
	if (!priority) return "Unset";
	return PRIORITY_LABELS[priority] ?? priority;
}

export function ProjectSettingsDialog({
	open,
	onOpenChange,
	project,
	loading,
	isOwner,
}: ProjectSettingsDialogProps) {
	const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
	const { mutate: updateProjectStatus, isPending: isUpdatingStatus } =
		useUpdateProjectStatus();
	const [projectStatus, setProjectStatus] = useState<string>("active");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [priority, setPriority] = useState<string>("medium");
	const [category, setCategory] = useState<string>("");
	const [key, setKey] = useState("");
	const [enableTimeTracking, setEnableTimeTracking] = useState<boolean>(true);
	const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
	const [selectedView, setSelectedView] = useState<string>("board");
	const [members, setMembers] = useState<ProjectMember[]>([]);

	// Initialize state from project data
	useEffect(() => {
		if (project) {
			setProjectStatus(project.status);
			setStartDate(project.startDate || "");
			setEndDate(project.endDate || "");
			setPriority(project.priority ? project.priority : "unset");
			setCategory(project.category || "");
			setKey(project.key || "");
			setEnableTimeTracking(project.settings?.enableTimeTracking ?? true);
			setEnableNotifications(project.settings?.enableNotifications ?? true);
			setSelectedView(project.settings?.selectedView || "board");
			// TODO: Load members from project
			setMembers([]);
		}
	}, [project]);

	const handleSubmit = async () => {
		if (!project || !isOwner) return;

		try {
			// Update project status if it changed
			if (projectStatus !== project.status) {
				await new Promise<void>((resolve, reject) => {
					updateProjectStatus(
						{ id: project.id, status: projectStatus as Project["status"] },
						{
							onSuccess: () => resolve(),
							onError: (error) => reject(error),
						},
					);
				});
			}

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

			await updateProject(
				{
					id: project.id,
					params: {
						name: project.name, // Keep existing name
						description: project.description,
						key: key.trim() || null,
						startDate: startDate || null,
						endDate: endDate || null,
						priority:
							priority === "unset" || priority === "medium"
								? null
								: (priority as "low" | "high" | "critical"),
						category: category.trim() || null,
						settings: Object.keys(settings).length > 0 ? settings : undefined,
					},
				},
				{
					onSuccess: () => {
						toast.success("Project settings updated successfully");
						onOpenChange(false);
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update project settings",
						);
					},
				},
			);
		} catch (error) {
			console.error("Failed to update project:", error);
			toast.error("Failed to update project settings", {
				description:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			});
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Project Settings</DialogTitle>
					<DialogDescription>
						{isOwner
							? "Edit project configurations and settings."
							: "View project configurations and settings."}
					</DialogDescription>
				</DialogHeader>
				{loading ? (
					<LoadingState label="Loading settings..." />
				) : project ? (
					isOwner ? (
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
										onValueChange={(value) =>
											setPriority(value === "unset" ? "medium" : value)
										}
									>
										<SelectTrigger
											id="priority"
											className="mt-2"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="unset">Unset</SelectItem>
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

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isUpdating || isUpdatingStatus}
								>
									Cancel
								</Button>
								<Button
									onClick={handleSubmit}
									disabled={isUpdating || isUpdatingStatus}
								>
									{isUpdating || isUpdatingStatus
										? "Saving..."
										: "Save Changes"}
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-8">
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Creation Step 1 · Basic Details
								</p>
								<div className="mt-3 grid gap-4 md:grid-cols-2">
									<Detail
										label="Project Name"
										value={project.name}
									/>
									<Detail
										label="Task Key Prefix"
										value={project.key ?? "Not set"}
									/>
									<div className="md:col-span-2">
										<Detail
											label="Description"
											value={
												project.description?.trim() || "No description provided"
											}
										/>
									</div>
								</div>
							</div>

							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Creation Step 3 · Configuration
								</p>
								<div className="mt-3 grid gap-4 md:grid-cols-2">
									<Detail
										label="Project Status"
										value={
											<div className="space-y-1">
												<p>{getProjectStatusLabel(project.status)}</p>
												<p className="text-xs text-muted-foreground">
													{getProjectStatusDescription(project.status)}
												</p>
											</div>
										}
									/>
									<Detail
										label="Priority"
										value={getPriorityLabel(project.priority)}
									/>
									<Detail
										label="Category"
										value={project.category ?? "Not set"}
									/>
									<Detail
										label="Start Date"
										value={formatDate(project.startDate)}
									/>
									<Detail
										label="End Date"
										value={formatDate(project.endDate)}
									/>
									<Detail
										label="Default View"
										value={getProjectViewLabel(project.settings?.selectedView)}
									/>
									<Detail
										label="Time Tracking"
										value={
											project.settings?.enableTimeTracking
												? "Enabled"
												: "Disabled"
										}
									/>
									<Detail
										label="Notifications"
										value={
											project.settings?.enableNotifications
												? "Enabled"
												: "Disabled"
										}
									/>
								</div>
							</div>

							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Operational Metadata
								</p>
								<div className="mt-3 grid gap-4 md:grid-cols-2">
									<Detail
										label="Created"
										value={formatDate(project.createdAt)}
									/>
									<Detail
										label="Last Updated"
										value={formatDate(project.updatedAt)}
									/>
								</div>
							</div>
						</div>
					)
				) : (
					<EmptyState message="Project not found." />
				)}
			</DialogContent>
		</Dialog>
	);
}
