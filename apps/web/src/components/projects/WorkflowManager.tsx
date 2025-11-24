/**
 * Workflow Manager Component
 * Modal for creating and editing workflows
 */

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
	useWorkflows,
	useWorkflow,
	useCreateWorkflow,
	useDeleteWorkflow,
} from "@/lib/hooks/use-workflows";
import { WorkflowStatusEditor } from "./WorkflowStatusEditor";
import { Plus, Trash2 } from "lucide-react";

interface WorkflowManagerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WorkflowManager({ open, onOpenChange }: WorkflowManagerProps) {
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
	const [workflowType, setWorkflowType] = useState<"task" | "subtask">("task");
	const [workflowName, setWorkflowName] = useState("");
	const [workflowDescription, setWorkflowDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const { data: workflows = [] } = useWorkflows({ type: workflowType });
	const { data: selectedWorkflow } = useWorkflow(selectedWorkflowId);
	const createWorkflow = useCreateWorkflow();
	const deleteWorkflow = useDeleteWorkflow();

	const handleCreateNew = () => {
		setIsCreating(true);
		setSelectedWorkflowId(null);
		setWorkflowName("");
		setWorkflowDescription("");
	};

	const handleSelectWorkflow = (id: string) => {
		setSelectedWorkflowId(id);
		setIsCreating(false);
	};

	const handleSaveWorkflow = async () => {
		if (!workflowName.trim()) {
			return;
		}

		try {
			await createWorkflow.mutateAsync({
				name: workflowName,
				description: workflowDescription || undefined,
				workflowType,
			});
			setIsCreating(false);
			setWorkflowName("");
			setWorkflowDescription("");
		} catch (error) {
			console.error("Failed to create workflow:", error);
		}
	};

	const handleDeleteWorkflow = async (id: string) => {
		if (confirm("Are you sure you want to delete this workflow?")) {
			try {
				await deleteWorkflow.mutateAsync(id);
				if (selectedWorkflowId === id) {
					setSelectedWorkflowId(null);
				}
			} catch (error) {
				console.error("Failed to delete workflow:", error);
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Workflows</DialogTitle>
					<DialogDescription>
						Create and manage workflows for tasks and subtasks
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-4 mt-4">
					{/* Left: Workflow List */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>Workflow Type</Label>
							<Select
								value={workflowType}
								onValueChange={(value) => {
									setWorkflowType(value as "task" | "subtask");
									setSelectedWorkflowId(null);
									setIsCreating(false);
								}}
							>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="task">Task</SelectItem>
									<SelectItem value="subtask">Subtask</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Button onClick={handleCreateNew} className="w-full">
							<Plus className="h-4 w-4 mr-2" />
							Create New Workflow
						</Button>

						<div className="space-y-2 max-h-96 overflow-y-auto">
							{workflows.map((workflow) => (
								<div
									key={workflow.id}
									className={`p-3 retro-border rounded-none cursor-pointer transition-colors ${
										selectedWorkflowId === workflow.id
											? "bg-primary text-primary-foreground"
											: "hover:bg-accent"
									}`}
									onClick={() => handleSelectWorkflow(workflow.id)}
								>
									<div className="flex items-center justify-between">
										<div>
											<div className="font-medium">{workflow.name}</div>
											{workflow.description && (
												<div className="text-xs opacity-80 mt-1">
													{workflow.description}
												</div>
											)}
										</div>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteWorkflow(workflow.id);
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right: Workflow Editor */}
					<div className="space-y-4">
						{isCreating ? (
							<div className="space-y-4">
								<div>
									<Label htmlFor="workflow-name">Name</Label>
									<Input
										id="workflow-name"
										value={workflowName}
										onChange={(e) => setWorkflowName(e.target.value)}
										placeholder="Enter workflow name"
									/>
								</div>
								<div>
									<Label htmlFor="workflow-description">Description</Label>
									<Textarea
										id="workflow-description"
										value={workflowDescription}
										onChange={(e) => setWorkflowDescription(e.target.value)}
										placeholder="Enter workflow description (optional)"
										rows={3}
									/>
								</div>
								<Button onClick={handleSaveWorkflow} disabled={!workflowName.trim()}>
									Save Workflow
								</Button>
							</div>
						) : selectedWorkflow ? (
							<WorkflowStatusEditor workflow={selectedWorkflow} />
						) : (
							<div className="text-center text-muted-foreground py-8">
								Select a workflow to edit or create a new one
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

