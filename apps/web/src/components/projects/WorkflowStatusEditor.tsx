/**
 * Workflow Status Editor Component
 * Manages statuses for a workflow
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
	useCreateStatus,
	useUpdateStatus,
	useDeleteStatus,
	useReorderStatuses,
} from "@/lib/hooks/use-workflows";
import type { Workflow, WorkflowStatus } from "@/lib/api/workflows.api";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Badge } from "../ui/badge";

interface WorkflowStatusEditorProps {
	workflow: Workflow;
}

export function WorkflowStatusEditor({ workflow }: WorkflowStatusEditorProps) {
	const [editingStatus, setEditingStatus] = useState<WorkflowStatus | null>(null);
	const [statusName, setStatusName] = useState("");
	const [statusDescription, setStatusDescription] = useState("");
	const [statusPhase, setStatusPhase] = useState<WorkflowStatus["phase"]>("backlog");
	const [statusColor, setStatusColor] = useState("#808080");

	const createStatus = useCreateStatus();
	const updateStatus = useUpdateStatus();
	const deleteStatus = useDeleteStatus();
	const reorderStatuses = useReorderStatuses();

	const statuses = workflow.statuses || [];

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
		<div className="space-y-4">
			<div>
				<h3 className="font-bold text-lg mb-2">{workflow.name}</h3>
				<p className="text-sm text-muted-foreground mb-4">
					{workflow.description || "No description"}
				</p>
			</div>

			{/* Status List */}
			<div className="space-y-2">
				<Label>Statuses</Label>
				<div className="space-y-2 max-h-64 overflow-y-auto">
					{statuses
						.sort((a, b) => a.position - b.position)
						.map((status) => (
							<div
								key={status.id}
								className="flex items-center gap-2 p-2 retro-border rounded-none"
							>
								<GripVertical className="h-4 w-4 text-muted-foreground" />
								<div
									className="w-4 h-4 rounded"
									style={{ backgroundColor: status.colorCode }}
								/>
								<div className="flex-1">
									<div className="font-medium">{status.name}</div>
									<div className="text-xs text-muted-foreground">
										{status.phase}
									</div>
								</div>
								<Badge variant="outline">{status.phase}</Badge>
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

			{/* Add/Edit Status Form */}
			<div className="space-y-4 pt-4 border-t">
				<Label>
					{editingStatus ? "Edit Status" : "Add New Status"}
				</Label>
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
								<Button onClick={handleUpdateStatus} className="flex-1">
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
							<Button onClick={handleCreateStatus} className="w-full">
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

