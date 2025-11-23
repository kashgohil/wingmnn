import {
  and,
  db,
  eq,
  inArray,
  projects,
  sql,
  subtasks,
  tasks,
  workflowStatuses,
  workflows,
} from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Task with relations
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  statusId: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  estimatedHours: number | null;
  estimatedPoints: number | null;
  progress: number | null;
  deletedAt: Date | null;
  deleted: boolean | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a task
 */
export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  statusId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  estimatedPoints?: number;
}

/**
 * Input for updating a task
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  estimatedPoints?: number;
}

/**
 * Filters for listing tasks
 */
export interface TaskFilters {
  projectId?: string;
  statusId?: string;
  assignedTo?: string;
  priority?: "low" | "medium" | "high" | "critical";
  startDateFrom?: Date;
  startDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Task error codes
 */
export enum TaskErrorCode {
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  STATUS_NOT_FOUND = "STATUS_NOT_FOUND",
  INVALID_STATUS = "INVALID_STATUS",
  INVALID_DATES = "INVALID_DATES",
  INVALID_ASSIGNEE = "INVALID_ASSIGNEE",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  ARCHIVED_PROJECT = "ARCHIVED_PROJECT",
}

/**
 * Task error class
 */
export class TaskError extends Error {
  constructor(
    public code: TaskErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TaskError";
  }
}

/**
 * Task Service
 * Handles task management, assignment, and status updates
 */
export class TaskService {
  /**
   * Create a new task
   * @param data - Task creation data
   * @param userId - ID of the user creating the task
   * @returns Created task
   */
  async createTask(data: CreateTaskInput, userId: string): Promise<Task> {
    // Check project access
    const hasAccess = await projectService.checkAccess(data.projectId, userId);
    if (!hasAccess) {
      throw new TaskError(
        TaskErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Check if project is archived
    const isArchived = await projectService.isArchived(data.projectId);
    if (isArchived) {
      throw new TaskError(
        TaskErrorCode.ARCHIVED_PROJECT,
        "Cannot create tasks in archived projects",
        400
      );
    }

    // Get project workflow
    const projectResult = await db
      .select({ workflowId: projects.workflowId })
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1);

    if (projectResult.length === 0) {
      throw new TaskError(
        TaskErrorCode.PROJECT_NOT_FOUND,
        "Project not found",
        404
      );
    }

    const workflowId = projectResult[0].workflowId;

    // Get workflow type to ensure it's a task workflow
    const workflowResult = await db
      .select({ workflowType: workflows.workflowType })
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    if (
      workflowResult.length === 0 ||
      workflowResult[0].workflowType !== "task"
    ) {
      throw new TaskError(
        TaskErrorCode.INVALID_STATUS,
        "Project workflow is not a task workflow",
        400
      );
    }

    // Determine initial status
    let statusId = data.statusId;
    if (!statusId) {
      // Get the first backlog status from the workflow
      const backlogStatus = await db
        .select()
        .from(workflowStatuses)
        .where(
          and(
            eq(workflowStatuses.workflowId, workflowId),
            eq(workflowStatuses.phase, "backlog")
          )
        )
        .orderBy(workflowStatuses.position)
        .limit(1);

      if (backlogStatus.length === 0) {
        throw new TaskError(
          TaskErrorCode.INVALID_STATUS,
          "No backlog status found in project workflow",
          400
        );
      }

      statusId = backlogStatus[0].id;
    } else {
      // Validate that the provided status belongs to the project workflow
      const statusResult = await db
        .select()
        .from(workflowStatuses)
        .where(
          and(
            eq(workflowStatuses.id, statusId),
            eq(workflowStatuses.workflowId, workflowId)
          )
        )
        .limit(1);

      if (statusResult.length === 0) {
        throw new TaskError(
          TaskErrorCode.INVALID_STATUS,
          "Status does not belong to project workflow",
          400
        );
      }
    }

    // Validate dates
    if (data.startDate && data.dueDate && data.startDate > data.dueDate) {
      throw new TaskError(
        TaskErrorCode.INVALID_DATES,
        "Start date must be before or equal to due date",
        400
      );
    }

    // Validate assignee if provided
    if (data.assignedTo) {
      const isAssigneeMember = await projectService.checkAccess(
        data.projectId,
        data.assignedTo
      );
      if (!isAssigneeMember) {
        throw new TaskError(
          TaskErrorCode.INVALID_ASSIGNEE,
          "Assigned user is not a project member",
          400
        );
      }
    }

    const result = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        projectId: data.projectId,
        title: data.title,
        description: data.description || null,
        statusId,
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || null,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        estimatedHours: data.estimatedHours || null,
        estimatedPoints: data.estimatedPoints || null,
        progress: 0,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a task by ID
   * @param taskId - Task ID
   * @param userId - User ID requesting the task
   * @returns Task or null if not found or no access
   */
  async getTask(taskId: string, userId: string): Promise<Task | null> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const task = result[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return task;
  }

  /**
   * List tasks with filters
   * @param filters - Task filters
   * @param userId - User ID requesting the list
   * @returns List of tasks
   */
  async listTasks(filters: TaskFilters, userId: string): Promise<Task[]> {
    const conditions: any[] = [];

    // Project filter
    if (filters.projectId) {
      // Check project access
      const hasAccess = await projectService.checkAccess(
        filters.projectId,
        userId
      );
      if (!hasAccess) {
        return [];
      }
      conditions.push(eq(tasks.projectId, filters.projectId));
    } else {
      // Get all accessible projects
      const accessibleProjects = await projectService.listProjects(userId);
      const projectIds = accessibleProjects.map((p) => p.id);
      if (projectIds.length === 0) {
        return [];
      }
      conditions.push(inArray(tasks.projectId, projectIds));
    }

    // Status filter
    if (filters.statusId) {
      conditions.push(eq(tasks.statusId, filters.statusId));
    }

    // Assignee filter
    if (filters.assignedTo) {
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    }

    // Priority filter
    if (filters.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }

    // Start date filters
    if (filters.startDateFrom) {
      conditions.push(sql`${tasks.startDate} >= ${filters.startDateFrom}`);
    }
    if (filters.startDateTo) {
      conditions.push(sql`${tasks.startDate} <= ${filters.startDateTo}`);
    }

    // Due date filters
    if (filters.dueDateFrom) {
      conditions.push(sql`${tasks.dueDate} >= ${filters.dueDateFrom}`);
    }
    if (filters.dueDateTo) {
      conditions.push(sql`${tasks.dueDate} <= ${filters.dueDateTo}`);
    }

    // Deleted filter
    if (!filters.includeDeleted) {
      conditions.push(sql`${tasks.deletedAt} IS NULL`);
    }

    let query = db
      .select()
      .from(tasks)
      .where(and(...conditions));

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters.offset) {
      query = query.offset(filters.offset) as any;
    }

    const result = await query;
    return result;
  }

  /**
   * Update a task
   * @param taskId - Task ID
   * @param data - Task update data
   * @param userId - User ID requesting the update
   * @returns Updated task
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string
  ): Promise<Task> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    // Validate dates if both are being updated or one is being updated
    const newStartDate =
      data.startDate !== undefined ? data.startDate : task.startDate;
    const newDueDate = data.dueDate !== undefined ? data.dueDate : task.dueDate;

    if (newStartDate && newDueDate && newStartDate > newDueDate) {
      throw new TaskError(
        TaskErrorCode.INVALID_DATES,
        "Start date must be before or equal to due date",
        400
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: userId,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.estimatedHours !== undefined)
      updateData.estimatedHours = data.estimatedHours;
    if (data.estimatedPoints !== undefined)
      updateData.estimatedPoints = data.estimatedPoints;

    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  /**
   * Delete a task (soft delete)
   * @param taskId - Task ID
   * @param userId - User ID requesting deletion
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    // Soft delete the task
    await db
      .update(tasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId));

    // Soft delete all subtasks
    await db
      .update(subtasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subtasks.taskId, taskId));
  }

  /**
   * Assign a task to a user
   * @param taskId - Task ID
   * @param assigneeId - User ID to assign
   * @param userId - User ID making the assignment
   */
  async assignTask(
    taskId: string,
    assigneeId: string,
    userId: string
  ): Promise<void> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    // Validate assignee is a project member
    const isAssigneeMember = await projectService.checkAccess(
      task.projectId,
      assigneeId
    );
    if (!isAssigneeMember) {
      throw new TaskError(
        TaskErrorCode.INVALID_ASSIGNEE,
        "Assigned user is not a project member",
        400
      );
    }

    await db
      .update(tasks)
      .set({
        assignedTo: assigneeId,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId));
  }

  /**
   * Unassign a task
   * @param taskId - Task ID
   * @param userId - User ID making the change
   */
  async unassignTask(taskId: string, userId: string): Promise<void> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    await db
      .update(tasks)
      .set({
        assignedTo: null,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId));
  }

  /**
   * Update task status
   * @param taskId - Task ID
   * @param statusId - New status ID
   * @param userId - User ID making the change
   * @returns Updated task
   */
  async updateTaskStatus(
    taskId: string,
    statusId: string,
    userId: string
  ): Promise<Task> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    // Get project workflow
    const projectResult = await db
      .select({ workflowId: projects.workflowId })
      .from(projects)
      .where(eq(projects.id, task.projectId))
      .limit(1);

    if (projectResult.length === 0) {
      throw new TaskError(
        TaskErrorCode.PROJECT_NOT_FOUND,
        "Project not found",
        404
      );
    }

    const workflowId = projectResult[0].workflowId;

    // Validate that the status belongs to the project workflow
    const statusResult = await db
      .select()
      .from(workflowStatuses)
      .where(
        and(
          eq(workflowStatuses.id, statusId),
          eq(workflowStatuses.workflowId, workflowId)
        )
      )
      .limit(1);

    if (statusResult.length === 0) {
      throw new TaskError(
        TaskErrorCode.INVALID_STATUS,
        "Status does not belong to project workflow",
        400
      );
    }

    const result = await db
      .update(tasks)
      .set({
        statusId,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  /**
   * Update task progress
   * @param taskId - Task ID
   * @param progress - Progress percentage (0-100)
   * @param userId - User ID making the change
   * @returns Updated task
   */
  async updateProgress(
    taskId: string,
    progress: number,
    userId: string
  ): Promise<Task> {
    // Get task and check access
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new TaskError(TaskErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      throw new TaskError(
        TaskErrorCode.FORBIDDEN,
        "Progress must be between 0 and 100",
        400
      );
    }

    const result = await db
      .update(tasks)
      .set({
        progress,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  /**
   * Calculate task progress from subtasks
   * @param taskId - Task ID
   * @returns Calculated progress percentage
   */
  async calculateProgress(taskId: string): Promise<number> {
    // Get all non-deleted subtasks
    const subtaskResults = await db
      .select({ progress: subtasks.progress })
      .from(subtasks)
      .where(
        and(eq(subtasks.taskId, taskId), sql`${subtasks.deletedAt} IS NULL`)
      );

    if (subtaskResults.length === 0) {
      return 0;
    }

    // Calculate average progress
    const totalProgress = subtaskResults.reduce(
      (sum, subtask) => sum + (subtask.progress || 0),
      0
    );
    const averageProgress = Math.round(totalProgress / subtaskResults.length);

    return averageProgress;
  }

  /**
   * Update task progress automatically based on subtasks
   * This should be called whenever a subtask's progress changes
   * @param taskId - Task ID
   * @param userId - User ID making the change
   * @returns Updated task
   */
  async updateProgressFromSubtasks(
    taskId: string,
    userId: string
  ): Promise<Task> {
    // Calculate progress from subtasks
    const calculatedProgress = await this.calculateProgress(taskId);

    // Update the task with calculated progress
    const result = await db
      .update(tasks)
      .set({
        progress: calculatedProgress,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }
}

// Export singleton instance
export const taskService = new TaskService();
