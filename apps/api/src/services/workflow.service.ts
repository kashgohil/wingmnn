import {
  and,
  db,
  eq,
  inArray,
  or,
  projects,
  sql,
  subtasks,
  tasks,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";

/**
 * Workflow with statuses
 */
export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  workflowType: "task" | "subtask";
  createdBy: string;
  isTemplate: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  statuses?: WorkflowStatus[];
}

/**
 * Workflow status
 */
export interface WorkflowStatus {
  id: string;
  workflowId: string;
  name: string;
  description: string | null;
  phase: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
  colorCode: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a workflow
 */
export interface CreateWorkflowInput {
  name: string;
  description?: string;
  workflowType: "task" | "subtask";
  isTemplate?: boolean;
}

/**
 * Input for creating a status
 */
export interface CreateStatusInput {
  name: string;
  description?: string;
  phase: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
  colorCode?: string;
  position?: number;
}

/**
 * Input for updating a status
 */
export interface UpdateStatusInput {
  name?: string;
  description?: string;
  phase?: "backlog" | "planning" | "in_progress" | "feedback" | "closed";
  colorCode?: string;
  position?: number;
}

/**
 * Workflow error codes
 */
export enum WorkflowErrorCode {
  WORKFLOW_NOT_FOUND = "WORKFLOW_NOT_FOUND",
  STATUS_NOT_FOUND = "STATUS_NOT_FOUND",
  WORKFLOW_IN_USE = "WORKFLOW_IN_USE",
  STATUS_IN_USE = "STATUS_IN_USE",
  INVALID_WORKFLOW = "INVALID_WORKFLOW",
  MISSING_REQUIRED_PHASES = "MISSING_REQUIRED_PHASES",
  UNAUTHORIZED = "UNAUTHORIZED",
}

/**
 * Workflow error class
 */
export class WorkflowError extends Error {
  constructor(
    public code: WorkflowErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}

/**
 * Workflow Service
 * Handles workflow and status management
 */
export class WorkflowService {
  /**
   * Create a new workflow
   * @param data - Workflow creation data
   * @param userId - ID of the user creating the workflow
   * @returns Created workflow
   */
  async createWorkflow(
    data: CreateWorkflowInput,
    userId: string
  ): Promise<Workflow> {
    const result = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        workflowType: data.workflowType,
        createdBy: userId,
        isTemplate: data.isTemplate || false,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a workflow by ID
   * @param workflowId - Workflow ID
   * @returns Workflow with statuses or null if not found
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    const workflowResult = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    if (workflowResult.length === 0) {
      return null;
    }

    const workflow = workflowResult[0];

    // Get statuses for this workflow
    const statusesResult = await db
      .select()
      .from(workflowStatuses)
      .where(eq(workflowStatuses.workflowId, workflowId))
      .orderBy(workflowStatuses.position);

    return {
      ...workflow,
      statuses: statusesResult,
    };
  }

  /**
   * List workflows accessible to a user
   * @param userId - User ID
   * @param type - Optional filter by workflow type
   * @returns List of workflows
   */
  async listWorkflows(
    userId: string,
    type?: "task" | "subtask"
  ): Promise<Workflow[]> {
    const conditions = [
      or(eq(workflows.isTemplate, true), eq(workflows.createdBy, userId)),
    ];

    if (type) {
      conditions.push(eq(workflows.workflowType, type));
    }

    const result = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .orderBy(workflows.name);

    return result;
  }

  /**
   * List template workflows
   * @param type - Optional filter by workflow type
   * @returns List of template workflows
   */
  async listTemplateWorkflows(type?: "task" | "subtask"): Promise<Workflow[]> {
    const conditions = [eq(workflows.isTemplate, true)];

    if (type) {
      conditions.push(eq(workflows.workflowType, type));
    }

    const result = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .orderBy(workflows.name);

    return result;
  }

  /**
   * Delete a workflow
   * @param workflowId - Workflow ID
   * @param userId - User ID requesting deletion
   * @throws WorkflowError if workflow is in use or user is not authorized
   */
  async deleteWorkflow(workflowId: string, userId: string): Promise<void> {
    // Check if workflow exists and user is authorized
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    // Only the creator can delete a workflow (unless it's a template)
    if (!workflow.isTemplate && workflow.createdBy !== userId) {
      throw new WorkflowError(
        WorkflowErrorCode.UNAUTHORIZED,
        "Only the workflow creator can delete it",
        403
      );
    }

    // Check if workflow is in use by any project
    const projectsUsingWorkflow = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.workflowId, workflowId))
      .limit(1);

    if (projectsUsingWorkflow.length > 0) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_IN_USE,
        "Cannot delete workflow that is in use by projects",
        400
      );
    }

    // Delete workflow (cascade will delete statuses)
    await db.delete(workflows).where(eq(workflows.id, workflowId));
  }

  /**
   * Add a status to a workflow
   * @param workflowId - Workflow ID
   * @param data - Status creation data
   * @param userId - User ID adding the status
   * @returns Created status
   */
  async addStatus(
    workflowId: string,
    data: CreateStatusInput,
    userId: string
  ): Promise<WorkflowStatus> {
    // Check if workflow exists
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    // Only the creator can modify a workflow (unless it's a template)
    if (!workflow.isTemplate && workflow.createdBy !== userId) {
      throw new WorkflowError(
        WorkflowErrorCode.UNAUTHORIZED,
        "Only the workflow creator can modify it",
        403
      );
    }

    // Determine position if not provided
    let position = data.position;
    if (position === undefined) {
      // Get the highest position and add 1
      const maxPositionResult = await db
        .select({ maxPosition: sql<number>`MAX(${workflowStatuses.position})` })
        .from(workflowStatuses)
        .where(eq(workflowStatuses.workflowId, workflowId));

      const maxPosition = maxPositionResult[0]?.maxPosition;
      position = maxPosition !== null ? maxPosition + 1 : 0;
    }

    const result = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId,
        name: data.name,
        description: data.description || null,
        phase: data.phase,
        colorCode: data.colorCode || "#808080",
        position,
      })
      .returning();

    return result[0];
  }

  /**
   * Update a status
   * @param statusId - Status ID
   * @param data - Status update data
   * @param userId - User ID updating the status
   * @returns Updated status
   */
  async updateStatus(
    statusId: string,
    data: UpdateStatusInput,
    userId: string
  ): Promise<WorkflowStatus> {
    // Get the status and its workflow
    const statusResult = await db
      .select()
      .from(workflowStatuses)
      .where(eq(workflowStatuses.id, statusId))
      .limit(1);

    if (statusResult.length === 0) {
      throw new WorkflowError(
        WorkflowErrorCode.STATUS_NOT_FOUND,
        "Status not found",
        404
      );
    }

    const status = statusResult[0];

    // Check workflow authorization
    const workflow = await this.getWorkflow(status.workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    if (!workflow.isTemplate && workflow.createdBy !== userId) {
      throw new WorkflowError(
        WorkflowErrorCode.UNAUTHORIZED,
        "Only the workflow creator can modify it",
        403
      );
    }

    // Update status
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.phase !== undefined) updateData.phase = data.phase;
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;
    if (data.position !== undefined) updateData.position = data.position;

    const result = await db
      .update(workflowStatuses)
      .set(updateData)
      .where(eq(workflowStatuses.id, statusId))
      .returning();

    return result[0];
  }

  /**
   * Delete a status
   * @param statusId - Status ID
   * @param userId - User ID requesting deletion
   * @throws WorkflowError if status is in use
   */
  async deleteStatus(statusId: string, userId: string): Promise<void> {
    // Get the status and its workflow
    const statusResult = await db
      .select()
      .from(workflowStatuses)
      .where(eq(workflowStatuses.id, statusId))
      .limit(1);

    if (statusResult.length === 0) {
      throw new WorkflowError(
        WorkflowErrorCode.STATUS_NOT_FOUND,
        "Status not found",
        404
      );
    }

    const status = statusResult[0];

    // Check workflow authorization
    const workflow = await this.getWorkflow(status.workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    if (!workflow.isTemplate && workflow.createdBy !== userId) {
      throw new WorkflowError(
        WorkflowErrorCode.UNAUTHORIZED,
        "Only the workflow creator can modify it",
        403
      );
    }

    // Check if status is in use by any task
    const tasksUsingStatus = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.statusId, statusId))
      .limit(1);

    if (tasksUsingStatus.length > 0) {
      throw new WorkflowError(
        WorkflowErrorCode.STATUS_IN_USE,
        "Cannot delete status that is in use by tasks",
        400
      );
    }

    // Check if status is in use by any subtask
    const subtasksUsingStatus = await db
      .select({ id: subtasks.id })
      .from(subtasks)
      .where(eq(subtasks.statusId, statusId))
      .limit(1);

    if (subtasksUsingStatus.length > 0) {
      throw new WorkflowError(
        WorkflowErrorCode.STATUS_IN_USE,
        "Cannot delete status that is in use by subtasks",
        400
      );
    }

    // Delete status
    await db.delete(workflowStatuses).where(eq(workflowStatuses.id, statusId));
  }

  /**
   * Reorder statuses in a workflow
   * @param workflowId - Workflow ID
   * @param statusIds - Array of status IDs in desired order
   * @param userId - User ID requesting reorder
   */
  async reorderStatuses(
    workflowId: string,
    statusIds: string[],
    userId: string
  ): Promise<void> {
    // Check workflow authorization
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    if (!workflow.isTemplate && workflow.createdBy !== userId) {
      throw new WorkflowError(
        WorkflowErrorCode.UNAUTHORIZED,
        "Only the workflow creator can modify it",
        403
      );
    }

    // Verify all status IDs belong to this workflow
    const statusesResult = await db
      .select()
      .from(workflowStatuses)
      .where(
        and(
          eq(workflowStatuses.workflowId, workflowId),
          inArray(workflowStatuses.id, statusIds)
        )
      );

    if (statusesResult.length !== statusIds.length) {
      throw new WorkflowError(
        WorkflowErrorCode.INVALID_WORKFLOW,
        "Some status IDs do not belong to this workflow",
        400
      );
    }

    // Update positions
    for (let i = 0; i < statusIds.length; i++) {
      await db
        .update(workflowStatuses)
        .set({ position: i, updatedAt: new Date() })
        .where(eq(workflowStatuses.id, statusIds[i]));
    }
  }

  /**
   * Validate that a workflow has required phases
   * @param workflowId - Workflow ID
   * @returns true if valid, throws error otherwise
   */
  async validateWorkflowPhases(workflowId: string): Promise<boolean> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow || !workflow.statuses) {
      throw new WorkflowError(
        WorkflowErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    const phases = workflow.statuses.map((s) => s.phase);
    const hasBacklog = phases.includes("backlog");
    const hasClosed = phases.includes("closed");

    if (!hasBacklog || !hasClosed) {
      throw new WorkflowError(
        WorkflowErrorCode.MISSING_REQUIRED_PHASES,
        "Workflow must have at least one status in 'backlog' and 'closed' phases",
        400
      );
    }

    return true;
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
