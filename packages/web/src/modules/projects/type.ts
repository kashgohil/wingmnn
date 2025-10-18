import type { WorkflowStatus } from "@wingmnn/db";

export interface Task extends BaseDetails, Metadata {
  status?: string; // References WorkflowStatus.id
  projectId: string;
  attachments: Array<Attachment>;
}

// Extended types for workflow integration
export interface TaskWithWorkflow extends Task {
  workflowStatus?: WorkflowStatus;
}
