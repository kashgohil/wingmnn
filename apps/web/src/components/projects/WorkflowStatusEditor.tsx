/**
 * Workflow Status Editor Component
 * Manages statuses for a workflow
 */

import type { Workflow, WorkflowStatus } from "@/lib/api/workflows.api";
import {
	useCreateStatus,
	useDeleteStatus,
	useUpdateStatus,
} from "@/lib/hooks/use-workflows";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface WorkflowStatusEditorProps {
	workflow: Workflow;
}

export function WorkflowStatusEditor({ workflow }: WorkflowStatusEditorProps) {
	const [editingStatus, setEditingStatus] = useState<WorkflowStatus | null>(
		null,
	);
	const [statusName, setStatusName] = useState("");
	const [statusDescription, setStatusDescription] = useState("");
	const [statusPhase, setStatusPhase] =
		useState<WorkflowStatus["phase"]>("backlog");
	const [statusColor, setStatusColor] = useState("#808080");

	const createStatus = useCreateStatus();
	const updateStatus = useUpdateStatus();
	const deleteStatus = useDeleteStatus();

	const statuses = workflow.statuses || [];
	const phaseOrder: WorkflowStatus["phase"][] = [
		"backlog",
		"planning",
		"in_progress",
		"feedback",
		"closed",
	];
	const phaseLabels: Record<WorkflowStatus["phase"], string> = {
		backlog: "Backlog",
		planning: "Planning",
		in_progress: "In Progress",
		feedback: "Feedback",
		closed: "Closed",
	};
	const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
	const groupedStatuses = phaseOrder
		.map((phase) => ({
			phase,
			statuses: sortedStatuses.filter((status) => status.phase === phase),
		}))
		.filter((group) => group.statuses.length > 0);

	const handleCreateStatus = async () => {
		if (!statusName.trim()) {
			return;
		}

		try {
			await createStatus.mutateAsync({
				workflowId: workflow.id,
				params: {
					name: statusName,
					description: statusDescription || undefined,
					phase: statusPhase,
					colorCode: statusColor,
				},
			});
			setStatusName("");
			setStatusDescription("");
			setStatusPhase("backlog");
			setStatusColor("#808080");
		} catch (error) {
			console.error("Failed to create status:", error);
		}
	};

	const handleEditStatus = (status: WorkflowStatus) => {
		setEditingStatus(status);
		setStatusName(status.name);
		setStatusDescription(status.description || "");
		setStatusPhase(status.phase);
		setStatusColor(status.colorCode);
	};

	const handleUpdateStatus = async () => {
		if (!editingStatus || !statusName.trim()) {
			return;
		}

		try {
			await updateStatus.mutateAsync({
				workflowId: workflow.id,
				statusId: editingStatus.id,
				params: {
					name: statusName,
					description: statusDescription || undefined,
					phase: statusPhase,
					colorCode: statusColor,
				},
			});
			setEditingStatus(null);
			setStatusName("");
			setStatusDescription("");
		} catch (error) {
			console.error("Failed to update status:", error);
		}
	};

	const handleDeleteStatus = async (statusId: string) => {
		if (confirm("Are you sure you want to delete this status?")) {
			try {
				await deleteStatus.mutateAsync({
					workflowId: workflow.id,
					statusId,
				});
			} catch (error) {
				console.error("Failed to delete status:", error);
			}
		}
	};

	const handleCancelEdit = () => {
		setEditingStatus(null);
		setStatusName("");
		setStatusDescription("");
		setStatusPhase("backlog");
		setStatusColor("#808080");
	};

	return (
		<div className="gap-4 flex flex-col h-full">
			<div>
				<h3 className="font-bold text-lg mb-2">{workflow.name}</h3>
				<p className="text-sm text-muted-foreground mb-4">
					{workflow.description || "No description"}
				</p>
			</div>

			{/* Status List */}
			<div className="-2 flex-1 overflow-hidden flex flex-col">
				<Label className="mb-2">Statuses</Label>
				<div className="space-y-3 overflow-y-auto flex-1 pr-2 -mr-2">
					{groupedStatuses.length > 0 ? (
						groupedStatuses.map((group) => (
							<div
								key={group.phase}
								className="border border-border bg-muted/20"
							>
								<div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-background/70">
									<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										<span>{phaseLabels[group.phase]}</span>
										<Badge
											variant="outline"
											className="text-[10px]"
										>
											{group.statuses.length}{" "}
											{group.statuses.length === 1 ? "status" : "statuses"}
										</Badge>
									</div>
									<Badge variant="secondary">{group.phase}</Badge>
								</div>
								<div className="space-y-2 p-3">
									{group.statuses.map((status) => (
										<div
											key={status.id}
											className="flex items-center gap-2 p-2 retro-border rounded-none bg-background/60"
										>
											<GripVertical className="h-4 w-4 text-muted-foreground" />
											<div
												className="w-4 h-4 rounded"
												style={{ backgroundColor: status.colorCode }}
											/>
											<div className="flex-1">
												<div className="font-medium">{status.name}</div>
												{status.description && (
													<div className="text-xs text-muted-foreground line-clamp-2">
														{status.description}
													</div>
												)}
											</div>
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleEditStatus(status)}
											>
												Edit
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleDeleteStatus(status.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</div>
						))
					) : (
						<div className="text-center text-sm text-muted-foreground py-8 border border-dashed border-border/60">
							No statuses yet. Create one below to start defining this workflow.
						</div>
					)}
				</div>
			</div>

			{/* Add/Edit Status Form */}
			<div className="space-y-4 pt-4 border-t">
				<Label>{editingStatus ? "Edit Status" : "Add New Status"}</Label>
				<div className="space-y-2">
					<Input
						placeholder="Status name"
						value={statusName}
						onChange={(e) => setStatusName(e.target.value)}
					/>
					<Textarea
						placeholder="Description (optional)"
						value={statusDescription}
						onChange={(e) => setStatusDescription(e.target.value)}
						rows={2}
					/>
					<Select
						value={statusPhase}
						onValueChange={(value) =>
							setStatusPhase(value as WorkflowStatus["phase"])
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="backlog">Backlog</SelectItem>
							<SelectItem value="planning">Planning</SelectItem>
							<SelectItem value="in_progress">In Progress</SelectItem>
							<SelectItem value="feedback">Feedback</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex items-center gap-2">
						<Label htmlFor="status-color">Color</Label>
						<input
							id="status-color"
							type="color"
							value={statusColor}
							onChange={(e) => setStatusColor(e.target.value)}
							className="h-8 w-16 cursor-pointer"
						/>
					</div>
					<div className="flex gap-2">
						{editingStatus ? (
							<>
								<Button
									onClick={handleUpdateStatus}
									className="flex-1"
								>
									Update
								</Button>
								<Button
									variant="outline"
									onClick={handleCancelEdit}
									className="flex-1"
								>
									Cancel
								</Button>
							</>
						) : (
							<Button
								onClick={handleCreateStatus}
								className="w-full"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Status
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
