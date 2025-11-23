import { activityLogs, and, db, eq, sql, subtasks, tasks } from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  projectId: string | null;
  taskId: string | null;
  subtaskId: string | null;
  userId: string;
  activityType:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "assignment_change"
    | "comment_added"
    | "attachment_added"
    | "member_added"
    | "member_removed";
  entityType: string;
  entityId: string;
  changes: unknown;
  metadata: unknown;
  createdAt: Date;
}

/**
 * Input for logging an activity
 */
export interface LogActivityInput {
  projectId?: string;
  taskId?: string;
  subtaskId?: string;
  userId: string;
  activityType:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "assignment_change"
    | "comment_added"
    | "attachment_added"
    | "member_added"
    | "member_removed";
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

/**
 * Filters for listing activity logs
 */
export interface ActivityFilters {
  projectId?: string;
  taskId?: string;
  subtaskId?: string;
  userId?: string;
  activityType?:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "assignment_change"
    | "comment_added"
    | "attachment_added"
    | "member_added"
    | "member_removed";
  entityType?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Activity log error codes
 */
export enum ActivityLogErrorCode {
  FORBIDDEN = "FORBIDDEN",
  INVALID_INPUT = "INVALID_INPUT",
}

/**
 * Activity log error class
 */
export class ActivityLogError extends Error {
  constructor(
    public code: ActivityLogErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ActivityLogError";
  }
}

/**
 * Activity Log Service
 * Handles activity logging for all significant events in the system
 */
export class ActivityLogService {
  /**
   * Log an activity
   * @param data - Activity log data
   */
  async logActivity(data: LogActivityInput): Promise<void> {
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      projectId: data.projectId || null,
      taskId: data.taskId || null,
      subtaskId: data.subtaskId || null,
      userId: data.userId,
      activityType: data.activityType,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes || null,
      metadata: data.metadata || null,
    });
  }

  /**
   * List activity logs with filters
   * @param filters - Activity log filters
   * @param userId - User ID requesting the logs
   * @returns List of activity logs
   */
  async listActivities(
    filters: ActivityFilters,
    userId: string
  ): Promise<ActivityLog[]> {
    const conditions: any[] = [];

    // Project filter
    if (filters.projectId) {
      // Check project access
      const hasAccess = await projectService.checkAccess(
        filters.projectId,
        userId
      );
      if (!hasAccess) {
        throw new ActivityLogError(
          ActivityLogErrorCode.FORBIDDEN,
          "You do not have access to this project",
          403
        );
      }
      conditions.push(eq(activityLogs.projectId, filters.projectId));
    } else {
      // Get all accessible projects
      const accessibleProjects = await projectService.listProjects(userId);
      const projectIds = accessibleProjects.map((p) => p.id);

      if (projectIds.length === 0) {
        // User has no accessible projects, return empty array
        return [];
      }

      // Filter to only show logs from accessible projects
      // Include logs with null projectId (system-level logs) or logs from accessible projects
      conditions.push(
        sql`(${activityLogs.projectId} IS NULL OR ${
          activityLogs.projectId
        } IN (${sql.join(
          projectIds.map((id) => sql`${id}`),
          sql`, `
        )}))`
      );
    }

    // Task filter
    if (filters.taskId) {
      // Verify user has access to the task's project
      const taskResult = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, filters.taskId))
        .limit(1);

      if (taskResult.length > 0) {
        const hasAccess = await projectService.checkAccess(
          taskResult[0].projectId,
          userId
        );
        if (!hasAccess) {
          throw new ActivityLogError(
            ActivityLogErrorCode.FORBIDDEN,
            "You do not have access to this task",
            403
          );
        }
      }

      conditions.push(eq(activityLogs.taskId, filters.taskId));
    }

    // Subtask filter
    if (filters.subtaskId) {
      // Verify user has access to the subtask's project
      const subtaskResult = await db
        .select({ taskId: subtasks.taskId })
        .from(subtasks)
        .where(eq(subtasks.id, filters.subtaskId))
        .limit(1);

      if (subtaskResult.length > 0) {
        const taskResult = await db
          .select({ projectId: tasks.projectId })
          .from(tasks)
          .where(eq(tasks.id, subtaskResult[0].taskId))
          .limit(1);

        if (taskResult.length > 0) {
          const hasAccess = await projectService.checkAccess(
            taskResult[0].projectId,
            userId
          );
          if (!hasAccess) {
            throw new ActivityLogError(
              ActivityLogErrorCode.FORBIDDEN,
              "You do not have access to this subtask",
              403
            );
          }
        }
      }

      conditions.push(eq(activityLogs.subtaskId, filters.subtaskId));
    }

    // User filter
    if (filters.userId) {
      conditions.push(eq(activityLogs.userId, filters.userId));
    }

    // Activity type filter
    if (filters.activityType) {
      conditions.push(eq(activityLogs.activityType, filters.activityType));
    }

    // Entity type filter
    if (filters.entityType) {
      conditions.push(eq(activityLogs.entityType, filters.entityType));
    }

    // Entity ID filter
    if (filters.entityId) {
      conditions.push(eq(activityLogs.entityId, filters.entityId));
    }

    // Date filters
    if (filters.dateFrom) {
      conditions.push(sql`${activityLogs.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${activityLogs.createdAt} <= ${filters.dateTo}`);
    }

    let query = db
      .select()
      .from(activityLogs)
      .where(and(...conditions))
      .orderBy(sql`${activityLogs.createdAt} DESC`);

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
   * Get activity logs for a specific project
   * @param projectId - Project ID
   * @param userId - User ID requesting the logs
   * @param limit - Optional limit
   * @param offset - Optional offset
   * @returns List of activity logs
   */
  async getProjectActivity(
    projectId: string,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ActivityLog[]> {
    return this.listActivities(
      {
        projectId,
        limit,
        offset,
      },
      userId
    );
  }

  /**
   * Get activity logs for a specific task
   * @param taskId - Task ID
   * @param userId - User ID requesting the logs
   * @param limit - Optional limit
   * @param offset - Optional offset
   * @returns List of activity logs
   */
  async getTaskActivity(
    taskId: string,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ActivityLog[]> {
    return this.listActivities(
      {
        taskId,
        limit,
        offset,
      },
      userId
    );
  }

  /**
   * Get activity logs for a specific subtask
   * @param subtaskId - Subtask ID
   * @param userId - User ID requesting the logs
   * @param limit - Optional limit
   * @param offset - Optional offset
   * @returns List of activity logs
   */
  async getSubtaskActivity(
    subtaskId: string,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ActivityLog[]> {
    return this.listActivities(
      {
        subtaskId,
        limit,
        offset,
      },
      userId
    );
  }
}

// Export singleton instance
export const activityLogService = new ActivityLogService();
