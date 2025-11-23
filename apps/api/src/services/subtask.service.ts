import {
  and,
  db,
  eq,
  sql,
  subtasks,
  tasks,
  workflowStatuses,
  workflows,
} from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Subtask with relations
 */
export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  statusId: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  progress: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a subtask
 */
export interface CreateSubtaskInput {
  taskId: string;
  title: string;
  description?: string;
  statusId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  startDate?: Date;
  dueDate?: Date;
}

/**
 * Input for updating a subtask
 */
export interface UpdateSubtaskInput {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  startDate?: Date;
  dueDate?: Date;
}

/**
 * Subtask error codes
 */
export enum SubtaskErrorCode {
  SUBTASK_NOT_FOUND = "SUBTASK_NOT_FOUND",
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  STATUS_NOT_FOUND = "STATUS_NOT_FOUND",
  INVALID_STATUS = "INVALID_STATUS",
  INVALID_DATES = "INVALID_DATES",
  INVALID_ASSIGNEE = "INVALID_ASSIGNEE",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

/**
 * Subtask error class
 */
export class SubtaskError extends Error {
  constructor(
    public code: SubtaskErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "SubtaskError";
  }
}

/**
 * Subtask Service
 * Handles subtask management, assignment, and status updates
 */
export class SubtaskService {
  /**
   * Create a new subtask
   * @param data - Subtask creation data
   * @param userId - ID of the user creating the subtask
   * @returns Created subtask
   */
  async createSubtask(
    data: CreateSubtaskInput,
    userId: string
  ): Promise<Subtask> {
    // Get parent task and check access
    const taskResult = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
      })
      .from(tasks)
      .where(eq(tasks.id, data.taskId))
      .limit(1);

    if (taskResult.length === 0) {
      throw new SubtaskError(
        SubtaskErrorCode.TASK_NOT_FOUND,
        "Parent task not found",
        404
      );
    }

    const task = taskResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new SubtaskError(
        SubtaskErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Get a subtask workflow (first available subtask workflow)
    const subtaskWorkflowResult = await db
      .select()
      .from(workflows)
      .where(eq(workflows.workflowType, "subtask"))
      .limit(1);

    if (subtaskWorkflowResult.length === 0) {
      throw new SubtaskError(
        SubtaskErrorCode.INVALID_STATUS,
        "No subtask workflow found",
        400
      );
    }

    const subtaskWorkflowId = subtaskWorkflowResult[0].id;

    // Determine initial status
    let statusId = data.statusId;
    if (!statusId) {
      // Get the first backlog status from the subtask workflow
      const backlogStatus = await db
        .select()
        .from(workflowStatuses)
        .where(
          and(
            eq(workflowStatuses.workflowId, subtaskWorkflowId),
            eq(workflowStatuses.phase, "backlog")
          )
        )
        .orderBy(workflowStatuses.position)
        .limit(1);

      if (backlogStatus.length === 0) {
        throw new SubtaskError(
          SubtaskErrorCode.INVALID_STATUS,
          "No backlog status found in subtask workflow",
          400
        );
      }

      statusId = backlogStatus[0].id;
    } else {
      // Validate that the provided status belongs to a subtask workflow
      const statusResult = await db
        .select({
          id: workflowStatuses.id,
          workflowId: workflowStatuses.workflowId,
        })
        .from(workflowStatuses)
        .innerJoin(workflows, eq(workflows.id, workflowStatuses.workflowId))
        .where(
          and(
            eq(workflowStatuses.id, statusId),
            eq(workflows.workflowType, "subtask")
          )
        )
        .limit(1);

      if (statusResult.length === 0) {
        throw new SubtaskError(
          SubtaskErrorCode.INVALID_STATUS,
          "Status does not belong to a subtask workflow",
          400
        );
      }
    }

    // Validate dates
    if (data.startDate && data.dueDate && data.startDate > data.dueDate) {
      throw new SubtaskError(
        SubtaskErrorCode.INVALID_DATES,
        "Start date must be before or equal to due date",
        400
      );
    }

    // Validate assignee if provided
    if (data.assignedTo) {
      const isAssigneeMember = await projectService.checkAccess(
        task.projectId,
        data.assignedTo
      );
      if (!isAssigneeMember) {
        throw new SubtaskError(
          SubtaskErrorCode.INVALID_ASSIGNEE,
          "Assigned user is not a project member",
          400
        );
      }
    }

    const result = await db
      .insert(subtasks)
      .values({
        id: crypto.randomUUID(),
        taskId: data.taskId,
        title: data.title,
        description: data.description || null,
        statusId,
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || null,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        progress: 0,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a subtask by ID
   * @param subtaskId - Subtask ID
   * @param userId - User ID requesting the subtask
   * @returns Subtask or null if not found or no access
   */
  async getSubtask(subtaskId: string, userId: string): Promise<Subtask | null> {
    const result = await db
      .select({
        id: subtasks.id,
        taskId: subtasks.taskId,
        title: subtasks.title,
        description: subtasks.description,
        statusId: subtasks.statusId,
        priority: subtasks.priority,
        assignedTo: subtasks.assignedTo,
        startDate: subtasks.startDate,
        dueDate: subtasks.dueDate,
        progress: subtasks.progress,
        deletedAt: subtasks.deletedAt,
        createdAt: subtasks.createdAt,
        updatedAt: subtasks.updatedAt,
        projectId: tasks.projectId,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(tasks.id, subtasks.taskId))
      .where(eq(subtasks.id, subtaskId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const subtask = result[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(
      subtask.projectId,
      userId
    );
    if (!hasAccess) {
      return null;
    }

    // Remove projectId from the returned object
    const { projectId, ...subtaskData } = subtask;
    return subtaskData;
  }

  /**
   * List subtasks for a parent task
   * @param taskId - Parent task ID
   * @param userId - User ID requesting the list
   * @returns List of subtasks
   */
  async listSubtasks(taskId: string, userId: string): Promise<Subtask[]> {
    // Get task and check access
    const taskResult = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0) {
      return [];
    }

    const task = taskResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      return [];
    }

    // Get all non-deleted subtasks for this task
    const result = await db
      .select()
      .from(subtasks)
      .where(
        and(eq(subtasks.taskId, taskId), sql`${subtasks.deletedAt} IS NULL`)
      )
      .orderBy(subtasks.createdAt);

    return result;
  }

  /**
   * Update a subtask
   * @param subtaskId - Subtask ID
   * @param data - Subtask update data
   * @param userId - User ID requesting the update
   * @returns Updated subtask
   */
  async updateSubtask(
    subtaskId: string,
    data: UpdateSubtaskInput,
    userId: string
  ): Promise<Subtask> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    // Validate dates if both are being updated or one is being updated
    const newStartDate =
      data.startDate !== undefined ? data.startDate : subtask.startDate;
    const newDueDate =
      data.dueDate !== undefined ? data.dueDate : subtask.dueDate;

    if (newStartDate && newDueDate && newStartDate > newDueDate) {
      throw new SubtaskError(
        SubtaskErrorCode.INVALID_DATES,
        "Start date must be before or equal to due date",
        400
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    const result = await db
      .update(subtasks)
      .set(updateData)
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return result[0];
  }

  /**
   * Delete a subtask (soft delete)
   * @param subtaskId - Subtask ID
   * @param userId - User ID requesting deletion
   */
  async deleteSubtask(subtaskId: string, userId: string): Promise<void> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    // Soft delete the subtask
    await db
      .update(subtasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId));
  }

  /**
   * Assign a subtask to a user
   * @param subtaskId - Subtask ID
   * @param assigneeId - User ID to assign
   * @param userId - User ID making the assignment
   */
  async assignSubtask(
    subtaskId: string,
    assigneeId: string,
    userId: string
  ): Promise<void> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    // Get parent task to check project membership
    const taskResult = await db
      .select({
        projectId: tasks.projectId,
      })
      .from(tasks)
      .where(eq(tasks.id, subtask.taskId))
      .limit(1);

    if (taskResult.length === 0) {
      throw new SubtaskError(
        SubtaskErrorCode.TASK_NOT_FOUND,
        "Parent task not found",
        404
      );
    }

    const projectId = taskResult[0].projectId;

    // Validate assignee is a project member
    const isAssigneeMember = await projectService.checkAccess(
      projectId,
      assigneeId
    );
    if (!isAssigneeMember) {
      throw new SubtaskError(
        SubtaskErrorCode.INVALID_ASSIGNEE,
        "Assigned user is not a project member",
        400
      );
    }

    await db
      .update(subtasks)
      .set({
        assignedTo: assigneeId,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId));
  }

  /**
   * Unassign a subtask
   * @param subtaskId - Subtask ID
   * @param userId - User ID making the change
   */
  async unassignSubtask(subtaskId: string, userId: string): Promise<void> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    await db
      .update(subtasks)
      .set({
        assignedTo: null,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId));
  }

  /**
   * Update subtask status
   * @param subtaskId - Subtask ID
   * @param statusId - New status ID
   * @param userId - User ID making the change
   * @returns Updated subtask
   */
  async updateSubtaskStatus(
    subtaskId: string,
    statusId: string,
    userId: string
  ): Promise<Subtask> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    // Validate that the status belongs to a subtask workflow
    const statusResult = await db
      .select({
        id: workflowStatuses.id,
        workflowId: workflowStatuses.workflowId,
      })
      .from(workflowStatuses)
      .innerJoin(workflows, eq(workflows.id, workflowStatuses.workflowId))
      .where(
        and(
          eq(workflowStatuses.id, statusId),
          eq(workflows.workflowType, "subtask")
        )
      )
      .limit(1);

    if (statusResult.length === 0) {
      throw new SubtaskError(
        SubtaskErrorCode.INVALID_STATUS,
        "Status does not belong to a subtask workflow",
        400
      );
    }

    const result = await db
      .update(subtasks)
      .set({
        statusId,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return result[0];
  }

  /**
   * Update subtask progress
   * @param subtaskId - Subtask ID
   * @param progress - Progress percentage (0-100)
   * @param userId - User ID making the change
   * @returns Updated subtask
   */
  async updateProgress(
    subtaskId: string,
    progress: number,
    userId: string
  ): Promise<Subtask> {
    // Get subtask and check access
    const subtask = await this.getSubtask(subtaskId, userId);
    if (!subtask) {
      throw new SubtaskError(
        SubtaskErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      throw new SubtaskError(
        SubtaskErrorCode.FORBIDDEN,
        "Progress must be between 0 and 100",
        400
      );
    }

    const result = await db
      .update(subtasks)
      .set({
        progress,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return result[0];
  }
}

// Export singleton instance
export const subtaskService = new SubtaskService();
