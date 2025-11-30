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
import { Textarea } from "@/components/ui/textarea";
import { type Project } from "@/lib/api/projects.api";
import { useUpdateProject } from "@/lib/hooks/use-projects";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/priority";
import { toast } from "@/lib/toast";
import { useForm } from "@tanstack/react-form";
import { catchError } from "@wingmnn/utils";
import { Plus, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { PriorityIcon, PriorityLabel } from "./PriorityLabel";

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

const PROJECT_PRIORITY_OPTIONS = PRIORITY_ORDER.map((priority) => ({
	value: priority,
	label: PRIORITY_META[priority].label,
}));

type ProjectSettingsFormValues = {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	priority: "unset" | NonNullable<Project["priority"]>;
	category: string;
	key: string;
	enableTimeTracking: boolean;
	enableNotifications: boolean;
	selectedView: string;
};

function getDefaultFormValues(
	project?: Project | null,
): ProjectSettingsFormValues {
	return {
		title: project?.name ?? "",
		description: project?.description ?? "",
		startDate: project?.startDate ?? "",
		endDate: project?.endDate ?? "",
		priority: project?.priority ?? "unset",
		category: project?.category ?? "",
		key: project?.key ?? "",
		enableTimeTracking: project?.settings?.enableTimeTracking ?? true,
		enableNotifications: project?.settings?.enableNotifications ?? true,
		selectedView: project?.settings?.selectedView ?? "board",
	};
}

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

export function ProjectSettingsDialog({
	open,
	onOpenChange,
	project,
	loading,
	isOwner,
}: ProjectSettingsDialogProps) {
	const { mutateAsync: updateProjectAsync, isPending: isUpdating } =
		useUpdateProject();
	const [members, setMembers] = useState<ProjectMember[]>([]);
	const form = useForm({
		defaultValues: getDefaultFormValues(project ?? null),
		onSubmit: async ({ value }) => {
			if (!project || !isOwner) {
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

			const priorityParam =
				value.priority === "unset" || value.priority === "medium"
					? null
					: (value.priority as "low" | "high" | "critical");

			const [, error] = await catchError(
				updateProjectAsync({
					id: project.id,
					params: {
						name: value.title.trim(),
						description: value.description.trim() || null,
						key: value.key.trim() || null,
						startDate: value.startDate || null,
						endDate: value.endDate || null,
						priority: priorityParam,
						category: value.category.trim() || null,
						settings: Object.keys(settings).length > 0 ? settings : undefined,
					},
				}),
			);
			if (error) {
				toast.error("Failed to update project", {
					description: error.message,
				});
				return;
			}

			toast.success("Project settings updated successfully");
			onOpenChange(false);
		},
	});

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
						<form
							className="space-y-6"
							noValidate
							onSubmit={(event) => {
								event.preventDefault();
								event.stopPropagation();
								form.handleSubmit();
							}}
						>
							{/* Title */}
							<div>
								<Label htmlFor="title">Title</Label>
								<form.Field name="title">
									{(field) => (
										<Input
											id="title"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter project title"
											className="mt-2"
										/>
									)}
								</form.Field>
								<p className="text-xs text-muted-foreground mt-1">
									The name of this project
								</p>
							</div>

							{/* Description */}
							<div>
								<Label htmlFor="description">Description</Label>
								<form.Field name="description">
									{(field) => (
										<Textarea
											id="description"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter project description"
											className="mt-2 min-h-[100px]"
										/>
									)}
								</form.Field>
								<p className="text-xs text-muted-foreground mt-1">
									Describe the purpose and goals of this project
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
													value: ProjectSettingsFormValues["priority"],
												) => field.handleChange(value)}
											>
												<SelectTrigger
													id="priority"
													className="mt-2"
												>
													<SelectValue asChild>
														<PriorityLabel
															priority={
																field.state.value === "unset"
																	? null
																	: field.state.value
															}
															className="text-sm font-medium"
														/>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="unset">Unset</SelectItem>
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
												<SelectItem value="timeline">Timeline View</SelectItem>
												<SelectItem value="calendar">Calendar View</SelectItem>
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

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isUpdating}
									type="button"
								>
									Cancel
								</Button>
								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Button
											type="submit"
											disabled={isUpdating || isSubmitting}
										>
											{isUpdating || isSubmitting
												? "Saving..."
												: "Save Changes"}
										</Button>
									)}
								</form.Subscribe>
							</div>
						</form>
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
										value={
											<PriorityLabel
												priority={project.priority}
												className="justify-end text-right"
											/>
										}
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
