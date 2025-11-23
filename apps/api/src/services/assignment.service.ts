import {
  and,
  audits,
  db,
  eq,
  inArray,
  projects,
  sql,
  subtasks,
  tasks,
} from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Assignment information
 */
export interface Assignment {
  id: string;
  type: "task" | "subtask";
  title: string;
  description: string | null;
  projectId: string;
  projectName: string;
  assignedTo: string | null;
  priority: "low" | "medium" | "high" | "critical";
  statusId: string;
  startDate: Date | null;
  dueDate: Date | null;
  progress: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Assignment error codes
 */
export enum AssignmentErrorCode {
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  SUBTASK_NOT_FOUND = "SUBTASK_NOT_FOUND",
  INVALID_ASSIGNEE = "INVALID_ASSIGNEE",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

/**
 * Assignment error class
 */
export class AssignmentError extends Error {
  constructor(
    public code: AssignmentErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AssignmentError";
  }
}

/**
 * Assignment Service
 * Handles assignment of tasks and subtasks to users with validation and logging
 */
export class AssignmentService {
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
    const taskResult = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        assignedTo: tasks.assignedTo,
        title: tasks.title,
      })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), sql`${tasks.deletedAt} IS NULL`))
      .limit(1);

    if (taskResult.length === 0) {
      throw new AssignmentError(
        AssignmentErrorCode.TASK_NOT_FOUND,
        "Task not found",
        404
      );
    }

    const task = taskResult[0];

    // Check that the user making the assignment has access to the project
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AssignmentError(
        AssignmentErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Validate assignee is a project member
    const isAssigneeMember = await projectService.checkAccess(
      task.projectId,
      assigneeId
    );
    if (!isAssigneeMember) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_ASSIGNEE,
        "Assigned user is not a project member",
        400
      );
    }

    const previousAssignee = task.assignedTo;

    // Update the task assignment
    await db
      .update(tasks)
      .set({
        assignedTo: assigneeId,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId));

    // Log the assignment change
    await this.logAssignmentChange(
      userId,
      "task",
      taskId,
      task.projectId,
      previousAssignee,
      assigneeId,
      task.title
    );
  }

  /**
   * Unassign a task
   * @param taskId - Task ID
   * @param userId - User ID making the change
   */
  async unassignTask(taskId: string, userId: string): Promise<void> {
    // Get task and check access
    const taskResult = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        assignedTo: tasks.assignedTo,
        title: tasks.title,
      })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), sql`${tasks.deletedAt} IS NULL`))
      .limit(1);

    if (taskResult.length === 0) {
      throw new AssignmentError(
        AssignmentErrorCode.TASK_NOT_FOUND,
        "Task not found",
        404
      );
    }

    const task = taskResult[0];

    // Check access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AssignmentError(
        AssignmentErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    const previousAssignee = task.assignedTo;

    // Update the task assignment
    await db
      .update(tasks)
      .set({
        assignedTo: null,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(tasks.id, taskId));

    // Log the assignment removal
    if (previousAssignee) {
      await this.logAssignmentChange(
        userId,
        "task",
        taskId,
        task.projectId,
        previousAssignee,
        null,
        task.title
      );
    }
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
    const subtaskResult = await db
      .select({
        id: subtasks.id,
        taskId: subtasks.taskId,
        assignedTo: subtasks.assignedTo,
        title: subtasks.title,
        projectId: tasks.projectId,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(tasks.id, subtasks.taskId))
      .where(
        and(eq(subtasks.id, subtaskId), sql`${subtasks.deletedAt} IS NULL`)
      )
      .limit(1);

    if (subtaskResult.length === 0) {
      throw new AssignmentError(
        AssignmentErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    const subtask = subtaskResult[0];

    // Check that the user making the assignment has access to the project
    const hasAccess = await projectService.checkAccess(
      subtask.projectId,
      userId
    );
    if (!hasAccess) {
      throw new AssignmentError(
        AssignmentErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Validate assignee is a project member
    const isAssigneeMember = await projectService.checkAccess(
      subtask.projectId,
      assigneeId
    );
    if (!isAssigneeMember) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_ASSIGNEE,
        "Assigned user is not a project member",
        400
      );
    }

    const previousAssignee = subtask.assignedTo;

    // Update the subtask assignment
    await db
      .update(subtasks)
      .set({
        assignedTo: assigneeId,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId));

    // Log the assignment change
    await this.logAssignmentChange(
      userId,
      "subtask",
      subtaskId,
      subtask.projectId,
      previousAssignee,
      assigneeId,
      subtask.title
    );
  }

  /**
   * Unassign a subtask
   * @param subtaskId - Subtask ID
   * @param userId - User ID making the change
   */
  async unassignSubtask(subtaskId: string, userId: string): Promise<void> {
    // Get subtask and check access
    const subtaskResult = await db
      .select({
        id: subtasks.id,
        taskId: subtasks.taskId,
        assignedTo: subtasks.assignedTo,
        title: subtasks.title,
        projectId: tasks.projectId,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(tasks.id, subtasks.taskId))
      .where(
        and(eq(subtasks.id, subtaskId), sql`${subtasks.deletedAt} IS NULL`)
      )
      .limit(1);

    if (subtaskResult.length === 0) {
      throw new AssignmentError(
        AssignmentErrorCode.SUBTASK_NOT_FOUND,
        "Subtask not found",
        404
      );
    }

    const subtask = subtaskResult[0];

    // Check access
    const hasAccess = await projectService.checkAccess(
      subtask.projectId,
      userId
    );
    if (!hasAccess) {
      throw new AssignmentError(
        AssignmentErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    const previousAssignee = subtask.assignedTo;

    // Update the subtask assignment
    await db
      .update(subtasks)
      .set({
        assignedTo: null,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId));

    // Log the assignment removal
    if (previousAssignee) {
      await this.logAssignmentChange(
        userId,
        "subtask",
        subtaskId,
        subtask.projectId,
        previousAssignee,
        null,
        subtask.title
      );
    }
  }

  /**
   * List all assignments for a user
   * @param assigneeId - User ID to get assignments for
   * @param userId - User ID requesting the list (for access control)
   * @returns List of assignments (tasks and subtasks)
   */
  async listAssignments(
    assigneeId: string,
    userId: string
  ): Promise<Assignment[]> {
    // Get all accessible projects for the requesting user
    const accessibleProjects = await projectService.listProjects(userId);
    const projectIds = accessibleProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    // Get all tasks assigned to the user in accessible projects
    const taskAssignments = await db
      .select({
        id: tasks.id,
        type: sql<"task">`'task'`,
        title: tasks.title,
        description: tasks.description,
        projectId: tasks.projectId,
        projectName: projects.name,
        assignedTo: tasks.assignedTo,
        priority: tasks.priority,
        statusId: tasks.statusId,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        progress: tasks.progress,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .where(
        and(
          eq(tasks.assignedTo, assigneeId),
          inArray(tasks.projectId, projectIds),
          sql`${tasks.deletedAt} IS NULL`
        )
      )
      .orderBy(tasks.createdAt);

    // Get all subtasks assigned to the user in accessible projects
    const subtaskAssignments = await db
      .select({
        id: subtasks.id,
        type: sql<"subtask">`'subtask'`,
        title: subtasks.title,
        description: subtasks.description,
        projectId: tasks.projectId,
        projectName: projects.name,
        assignedTo: subtasks.assignedTo,
        priority: subtasks.priority,
        statusId: subtasks.statusId,
        startDate: subtasks.startDate,
        dueDate: subtasks.dueDate,
        progress: subtasks.progress,
        createdAt: subtasks.createdAt,
        updatedAt: subtasks.updatedAt,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(tasks.id, subtasks.taskId))
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .where(
        and(
          eq(subtasks.assignedTo, assigneeId),
          inArray(tasks.projectId, projectIds),
          sql`${subtasks.deletedAt} IS NULL`
        )
      )
      .orderBy(subtasks.createdAt);

    // Combine and return all assignments
    return [...taskAssignments, ...subtaskAssignments] as Assignment[];
  }

  /**
   * Log an assignment change to the audit log
   * @param userId - User making the change
   * @param entityType - Type of entity (task or subtask)
   * @param entityId - ID of the entity
   * @param projectId - Project ID
   * @param oldAssignee - Previous assignee ID (null if none)
   * @param newAssignee - New assignee ID (null if unassigning)
   * @param entityTitle - Title of the entity for context
   */
  private async logAssignmentChange(
    userId: string,
    entityType: "task" | "subtask",
    entityId: string,
    projectId: string,
    oldAssignee: string | null,
    newAssignee: string | null,
    entityTitle: string
  ): Promise<void> {
    const changeType =
      oldAssignee === null
        ? "create"
        : newAssignee === null
        ? "delete"
        : "update";

    await db.insert(audits).values({
      userId,
      type: changeType,
      module: `${entityType}_assignment`,
      oldData: {
        entityType,
        entityId,
        projectId,
        assignedTo: oldAssignee,
        entityTitle,
      },
      newData: {
        entityType,
        entityId,
        projectId,
        assignedTo: newAssignee,
        entityTitle,
      },
    });
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();
