import {
  and,
  db,
  eq,
  inArray,
  sql,
  subtasks,
  tasks,
  timeEntries,
} from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Time entry with relations
 */
export interface TimeEntry {
  id: string;
  userId: string;
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  durationMinutes: number;
  date: Date;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a time entry
 */
export interface CreateTimeEntryInput {
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  durationMinutes: number;
  date: Date;
  description?: string;
}

/**
 * Input for updating a time entry
 */
export interface UpdateTimeEntryInput {
  durationMinutes?: number;
  date?: Date;
  description?: string;
}

/**
 * Filters for listing time entries
 */
export interface TimeEntryFilters {
  userId?: string;
  relatedEntityType?: "task" | "subtask";
  relatedEntityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Filters for time summary
 */
export interface TimeSummaryFilters {
  userId?: string;
  projectId?: string;
  taskId?: string;
  subtaskId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  groupBy?: "task" | "user" | "date";
}

/**
 * Time summary result
 */
export interface TimeSummary {
  totalMinutes: number;
  entries: Array<{
    groupKey: string;
    totalMinutes: number;
    entryCount: number;
  }>;
}

/**
 * Time tracking error codes
 */
export enum TimeTrackingErrorCode {
  TIME_ENTRY_NOT_FOUND = "TIME_ENTRY_NOT_FOUND",
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  SUBTASK_NOT_FOUND = "SUBTASK_NOT_FOUND",
  INVALID_DURATION = "INVALID_DURATION",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

/**
 * Time tracking error class
 */
export class TimeTrackingError extends Error {
  constructor(
    public code: TimeTrackingErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TimeTrackingError";
  }
}

/**
 * Time Tracking Service
 * Handles time entry creation, updates, deletion, and summary calculations
 */
export class TimeTrackingService {
  /**
   * Validate that a task or subtask exists and user has access
   * @param entityType - Type of entity (task or subtask)
   * @param entityId - Entity ID
   * @param userId - User ID
   * @returns Project ID if valid
   */
  private async validateEntityAccess(
    entityType: "task" | "subtask",
    entityId: string,
    userId: string
  ): Promise<string> {
    if (entityType === "task") {
      const taskResult = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(and(eq(tasks.id, entityId), sql`${tasks.deletedAt} IS NULL`))
        .limit(1);

      if (taskResult.length === 0) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.TASK_NOT_FOUND,
          "Task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.FORBIDDEN,
          "You do not have access to this task",
          403
        );
      }

      return projectId;
    } else {
      // subtask
      const subtaskResult = await db
        .select({ taskId: subtasks.taskId })
        .from(subtasks)
        .where(
          and(eq(subtasks.id, entityId), sql`${subtasks.deletedAt} IS NULL`)
        )
        .limit(1);

      if (subtaskResult.length === 0) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.SUBTASK_NOT_FOUND,
          "Subtask not found",
          404
        );
      }

      const taskId = subtaskResult[0].taskId;
      const taskResult = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (taskResult.length === 0) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.TASK_NOT_FOUND,
          "Parent task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.FORBIDDEN,
          "You do not have access to this subtask",
          403
        );
      }

      return projectId;
    }
  }

  /**
   * Create a new time entry
   * @param data - Time entry creation data
   * @param userId - ID of the user creating the time entry
   * @returns Created time entry
   */
  async createTimeEntry(
    data: CreateTimeEntryInput,
    userId: string
  ): Promise<TimeEntry> {
    // Validate duration is positive
    if (data.durationMinutes <= 0) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.INVALID_DURATION,
        "Duration must be a positive integer",
        400
      );
    }

    // Validate entity access
    await this.validateEntityAccess(
      data.relatedEntityType,
      data.relatedEntityId,
      userId
    );

    const result = await db
      .insert(timeEntries)
      .values({
        id: crypto.randomUUID(),
        userId,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        durationMinutes: data.durationMinutes,
        date: data.date,
        description: data.description || null,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a time entry by ID
   * @param entryId - Time entry ID
   * @param userId - User ID requesting the entry
   * @returns Time entry or null if not found or no access
   */
  async getTimeEntry(
    entryId: string,
    userId: string
  ): Promise<TimeEntry | null> {
    const result = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.id, entryId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];

    // Validate access to the related entity
    try {
      await this.validateEntityAccess(
        entry.relatedEntityType,
        entry.relatedEntityId,
        userId
      );
    } catch (error) {
      return null;
    }

    return entry;
  }

  /**
   * Update a time entry
   * @param entryId - Time entry ID
   * @param data - Time entry update data
   * @param userId - User ID requesting the update
   * @returns Updated time entry
   */
  async updateTimeEntry(
    entryId: string,
    data: UpdateTimeEntryInput,
    userId: string
  ): Promise<TimeEntry> {
    // Get entry and check access
    const entry = await this.getTimeEntry(entryId, userId);
    if (!entry) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.TIME_ENTRY_NOT_FOUND,
        "Time entry not found",
        404
      );
    }

    // Only the user who created the entry can update it
    if (entry.userId !== userId) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.FORBIDDEN,
        "You can only update your own time entries",
        403
      );
    }

    // Validate duration if provided
    if (data.durationMinutes !== undefined && data.durationMinutes <= 0) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.INVALID_DURATION,
        "Duration must be a positive integer",
        400
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.durationMinutes !== undefined)
      updateData.durationMinutes = data.durationMinutes;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.description !== undefined)
      updateData.description = data.description;

    const result = await db
      .update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, entryId))
      .returning();

    return result[0];
  }

  /**
   * Delete a time entry
   * @param entryId - Time entry ID
   * @param userId - User ID requesting deletion
   */
  async deleteTimeEntry(entryId: string, userId: string): Promise<void> {
    // Get entry and check access
    const entry = await this.getTimeEntry(entryId, userId);
    if (!entry) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.TIME_ENTRY_NOT_FOUND,
        "Time entry not found",
        404
      );
    }

    // Only the user who created the entry can delete it
    if (entry.userId !== userId) {
      throw new TimeTrackingError(
        TimeTrackingErrorCode.FORBIDDEN,
        "You can only delete your own time entries",
        403
      );
    }

    await db.delete(timeEntries).where(eq(timeEntries.id, entryId));
  }

  /**
   * List time entries with filters
   * @param filters - Time entry filters
   * @param userId - User ID requesting the list
   * @returns List of time entries
   */
  async listTimeEntries(
    filters: TimeEntryFilters,
    userId: string
  ): Promise<TimeEntry[]> {
    const conditions: any[] = [];

    // User filter - if not specified, default to requesting user
    const targetUserId = filters.userId || userId;
    conditions.push(eq(timeEntries.userId, targetUserId));

    // Entity type filter
    if (filters.relatedEntityType) {
      conditions.push(
        eq(timeEntries.relatedEntityType, filters.relatedEntityType)
      );
    }

    // Entity ID filter
    if (filters.relatedEntityId) {
      conditions.push(eq(timeEntries.relatedEntityId, filters.relatedEntityId));
    }

    // Date filters
    if (filters.dateFrom) {
      conditions.push(sql`${timeEntries.date} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${timeEntries.date} <= ${filters.dateTo}`);
    }

    let query = db
      .select()
      .from(timeEntries)
      .where(and(...conditions))
      .orderBy(sql`${timeEntries.date} DESC`);

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters.offset) {
      query = query.offset(filters.offset) as any;
    }

    const result = await query;

    // Filter out entries for entities the user doesn't have access to
    const accessibleEntries: TimeEntry[] = [];
    for (const entry of result) {
      try {
        await this.validateEntityAccess(
          entry.relatedEntityType,
          entry.relatedEntityId,
          userId
        );
        accessibleEntries.push(entry);
      } catch (error) {
        // Skip entries user doesn't have access to
        continue;
      }
    }

    return accessibleEntries;
  }

  /**
   * Get time summary with grouping
   * @param filters - Time summary filters
   * @param userId - User ID requesting the summary
   * @returns Time summary
   */
  async getTimeSummary(
    filters: TimeSummaryFilters,
    userId: string
  ): Promise<TimeSummary> {
    const conditions: any[] = [];

    // User filter
    if (filters.userId) {
      conditions.push(eq(timeEntries.userId, filters.userId));
    }

    // Date filters
    if (filters.dateFrom) {
      conditions.push(sql`${timeEntries.date} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${timeEntries.date} <= ${filters.dateTo}`);
    }

    // Entity filters
    if (filters.taskId) {
      conditions.push(
        and(
          eq(timeEntries.relatedEntityType, "task"),
          eq(timeEntries.relatedEntityId, filters.taskId)
        )
      );
    }
    if (filters.subtaskId) {
      conditions.push(
        and(
          eq(timeEntries.relatedEntityType, "subtask"),
          eq(timeEntries.relatedEntityId, filters.subtaskId)
        )
      );
    }

    // Project filter - need to get all tasks/subtasks in the project
    if (filters.projectId) {
      const hasAccess = await projectService.checkAccess(
        filters.projectId,
        userId
      );
      if (!hasAccess) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.FORBIDDEN,
          "You do not have access to this project",
          403
        );
      }

      // Get all task IDs in the project
      const projectTasks = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.projectId, filters.projectId));

      const taskIds = projectTasks.map((t) => t.id);

      if (taskIds.length === 0) {
        return { totalMinutes: 0, entries: [] };
      }

      // Get all subtask IDs for these tasks
      const projectSubtasks = await db
        .select({ id: subtasks.id })
        .from(subtasks)
        .where(inArray(subtasks.taskId, taskIds));

      const subtaskIds = projectSubtasks.map((s) => s.id);

      // Filter time entries to only those related to project tasks/subtasks
      if (subtaskIds.length > 0) {
        conditions.push(
          sql`(
            (${timeEntries.relatedEntityType} = 'task' AND ${timeEntries.relatedEntityId} IN ${taskIds}) OR
            (${timeEntries.relatedEntityType} = 'subtask' AND ${timeEntries.relatedEntityId} IN ${subtaskIds})
          )`
        );
      } else {
        conditions.push(
          sql`(${timeEntries.relatedEntityType} = 'task' AND ${timeEntries.relatedEntityId} IN ${taskIds})`
        );
      }
    }

    // Get all matching time entries
    const entries = await db
      .select()
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Filter by access
    const accessibleEntries: TimeEntry[] = [];
    for (const entry of entries) {
      try {
        await this.validateEntityAccess(
          entry.relatedEntityType,
          entry.relatedEntityId,
          userId
        );
        accessibleEntries.push(entry);
      } catch (error) {
        continue;
      }
    }

    // Calculate total
    const totalMinutes = accessibleEntries.reduce(
      (sum, entry) => sum + entry.durationMinutes,
      0
    );

    // Group by specified field
    const groupBy = filters.groupBy || "task";
    const grouped = new Map<string, { totalMinutes: number; count: number }>();

    for (const entry of accessibleEntries) {
      let groupKey: string;

      if (groupBy === "user") {
        groupKey = entry.userId;
      } else if (groupBy === "date") {
        groupKey = entry.date.toISOString().split("T")[0];
      } else {
        // task
        groupKey = `${entry.relatedEntityType}:${entry.relatedEntityId}`;
      }

      const existing = grouped.get(groupKey) || {
        totalMinutes: 0,
        count: 0,
      };
      grouped.set(groupKey, {
        totalMinutes: existing.totalMinutes + entry.durationMinutes,
        count: existing.count + 1,
      });
    }

    const groupedEntries = Array.from(grouped.entries()).map(
      ([groupKey, data]) => ({
        groupKey,
        totalMinutes: data.totalMinutes,
        entryCount: data.count,
      })
    );

    return {
      totalMinutes,
      entries: groupedEntries,
    };
  }
}

// Export singleton instance
export const timeTrackingService = new TimeTrackingService();
