/**
 * Workflow Manager Component
 * Modal for creating and editing workflows
 */

import {
	useCreateWorkflow,
	useDeleteWorkflow,
	useWorkflow,
	useWorkflows,
} from "@/lib/hooks/use-workflows";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { WorkflowStatusEditor } from "./WorkflowStatusEditor";

interface WorkflowManagerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WorkflowManager({ open, onOpenChange }: WorkflowManagerProps) {
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
		null,
	);
	const workflowType: "task" | "subtask" = "task";
	const [workflowName, setWorkflowName] = useState("");
	const [workflowDescription, setWorkflowDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const { data: workflows = [] } = useWorkflows({ type: workflowType });
	const {
		data: selectedWorkflow,
		isLoading: workflowLoading,
		isFetching: workflowFetching,
	} = useWorkflow(selectedWorkflowId);
	const isWorkflowBusy = workflowLoading || workflowFetching;
	const createWorkflow = useCreateWorkflow();
	const deleteWorkflow = useDeleteWorkflow();

	useEffect(() => {
		if (!open) {
			setSelectedWorkflowId(null);
			setWorkflowName("");
			setWorkflowDescription("");
			setIsCreating(false);
		}
	}, [open]);

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
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden p-0">
				<DialogHeader className="px-6 pt-6 pb-0">
					<DialogTitle>Manage Workflows</DialogTitle>
					<DialogDescription>
						Create and manage workflows for tasks and subtasks
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 px-6 pb-6 pt-4 overflow-hidden">
					<div className="grid h-full min-h-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
						{/* Left: Workflow List */}
						<div className="retro-border bg-background/80 rounded-sm p-4 flex flex-col gap-4 overflow-hidden min-h-0">
							<Button onClick={handleCreateNew}>
								<Plus className="h-4 w-4 mr-2" />
								Create New Workflow
							</Button>

							<div className="space-y-2 flex-1 overflow-y-auto pr-2 -mr-2">
								{workflows.map((workflow) => (
									<div
										key={workflow.id}
										className={`p-3 retro-border rounded-sm cursor-pointer transition-colors ${
											selectedWorkflowId === workflow.id
												? "bg-primary text-primary-foreground"
												: "hover:bg-accent"
										}`}
										onClick={() => handleSelectWorkflow(workflow.id)}
									>
										<div className="flex items-center justify-between gap-2">
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
								{workflows.length === 0 && (
									<div className="text-center text-muted-foreground text-sm py-8">
										No workflows yet. Create one to get started.
									</div>
								)}
							</div>
						</div>

						{/* Right: Workflow Editor */}
						<div className="retro-border bg-muted/20 rounded-sm p-6 flex flex-col overflow-hidden min-h-0">
							{isCreating ? (
								<div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2">
									<div>
										<Label
											htmlFor="workflow-name"
											className="mb-2"
										>
											Name
										</Label>
										<Input
											id="workflow-name"
											value={workflowName}
											onChange={(e) => setWorkflowName(e.target.value)}
											placeholder="Enter workflow name"
										/>
									</div>
									<div>
										<Label
											htmlFor="workflow-description"
											className="mb-2"
										>
											Description
										</Label>
										<Textarea
											id="workflow-description"
											value={workflowDescription}
											onChange={(e) => setWorkflowDescription(e.target.value)}
											placeholder="Enter workflow description (optional)"
											rows={3}
										/>
									</div>
									<Button
										onClick={handleSaveWorkflow}
										disabled={!workflowName.trim()}
										className="ml-auto w-full sm:w-auto"
									>
										Save Workflow
									</Button>
								</div>
							) : selectedWorkflowId ? (
								<div className="relative flex-1 min-h-0 overflow-hidden">
									{isWorkflowBusy && (
										<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<Loader2 className="h-4 w-4 animate-spin" />
												<span>Loading workflow…</span>
											</div>
										</div>
									)}
									{selectedWorkflow ? (
										<div className="h-full overflow-y-auto pr-2 -mr-2">
											<WorkflowStatusEditor workflow={selectedWorkflow} />
										</div>
									) : (
										<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
											{isWorkflowBusy
												? null
												: "Unable to load workflow details."}
										</div>
									)}
								</div>
							) : (
								<div className="text-center text-muted-foreground py-12">
									Select a workflow to edit or create a new one
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
