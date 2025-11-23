import { and, db, eq, notifications, sql, subtasks, tasks } from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  projectId: string | null;
  relatedEntityType: "task" | "subtask" | null;
  relatedEntityId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean | null;
  readAt: Date | null;
  createdAt: Date;
}

/**
 * Input for creating a notification
 */
export interface CreateNotificationInput {
  userId: string;
  projectId?: string;
  relatedEntityType?: "task" | "subtask";
  relatedEntityId?: string;
  type: string;
  title: string;
  message: string;
}

/**
 * Notification error codes
 */
export enum NotificationErrorCode {
  NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND",
  FORBIDDEN = "FORBIDDEN",
  INVALID_INPUT = "INVALID_INPUT",
}

/**
 * Notification error class
 */
export class NotificationError extends Error {
  constructor(
    public code: NotificationErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "NotificationError";
  }
}

/**
 * Notification Service
 * Handles notification creation, listing, and management
 */
export class NotificationService {
  /**
   * Create a notification
   * @param data - Notification creation data
   */
  async createNotification(data: CreateNotificationInput): Promise<void> {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      projectId: data.projectId || null,
      relatedEntityType: data.relatedEntityType || null,
      relatedEntityId: data.relatedEntityId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
    });
  }

  /**
   * Create notification for task assignment
   * @param taskId - Task ID
   * @param assigneeId - User ID being assigned
   * @param assignedBy - User ID who made the assignment
   */
  async createAssignmentNotification(
    taskId: string,
    assigneeId: string,
    assignedBy: string
  ): Promise<void> {
    // Get task details
    const taskResult = await db
      .select({
        title: tasks.title,
        projectId: tasks.projectId,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0) {
      return;
    }

    const task = taskResult[0];

    await this.createNotification({
      userId: assigneeId,
      projectId: task.projectId,
      relatedEntityType: "task",
      relatedEntityId: taskId,
      type: "assignment",
      title: "Task Assigned",
      message: `You have been assigned to task: ${task.title}`,
    });
  }

  /**
   * Create notification for subtask assignment
   * @param subtaskId - Subtask ID
   * @param assigneeId - User ID being assigned
   * @param assignedBy - User ID who made the assignment
   */
  async createSubtaskAssignmentNotification(
    subtaskId: string,
    assigneeId: string,
    assignedBy: string
  ): Promise<void> {
    // Get subtask and task details
    const subtaskResult = await db
      .select({
        subtaskTitle: subtasks.title,
        taskId: subtasks.taskId,
        projectId: tasks.projectId,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
      .where(eq(subtasks.id, subtaskId))
      .limit(1);

    if (subtaskResult.length === 0) {
      return;
    }

    const subtask = subtaskResult[0];

    await this.createNotification({
      userId: assigneeId,
      projectId: subtask.projectId,
      relatedEntityType: "subtask",
      relatedEntityId: subtaskId,
      type: "assignment",
      title: "Subtask Assigned",
      message: `You have been assigned to subtask: ${subtask.subtaskTitle}`,
    });
  }

  /**
   * Create notification for task status change
   * @param taskId - Task ID
   * @param oldStatusName - Old status name
   * @param newStatusName - New status name
   * @param changedBy - User ID who made the change
   */
  async createTaskStatusChangeNotification(
    taskId: string,
    oldStatusName: string,
    newStatusName: string,
    changedBy: string
  ): Promise<void> {
    // Get task details and assignee
    const taskResult = await db
      .select({
        title: tasks.title,
        projectId: tasks.projectId,
        assignedTo: tasks.assignedTo,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0 || !taskResult[0].assignedTo) {
      return;
    }

    const task = taskResult[0];

    // Don't notify the user who made the change
    if (task.assignedTo === changedBy) {
      return;
    }

    await this.createNotification({
      userId: task.assignedTo,
      projectId: task.projectId,
      relatedEntityType: "task",
      relatedEntityId: taskId,
      type: "status_change",
      title: "Task Status Changed",
      message: `Task "${task.title}" status changed from ${oldStatusName} to ${newStatusName}`,
    });
  }

  /**
   * Create notification for subtask status change
   * @param subtaskId - Subtask ID
   * @param oldStatusName - Old status name
   * @param newStatusName - New status name
   * @param changedBy - User ID who made the change
   */
  async createSubtaskStatusChangeNotification(
    subtaskId: string,
    oldStatusName: string,
    newStatusName: string,
    changedBy: string
  ): Promise<void> {
    // Get subtask details and assignee
    const subtaskResult = await db
      .select({
        title: subtasks.title,
        assignedTo: subtasks.assignedTo,
        projectId: tasks.projectId,
      })
      .from(subtasks)
      .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
      .where(eq(subtasks.id, subtaskId))
      .limit(1);

    if (subtaskResult.length === 0 || !subtaskResult[0].assignedTo) {
      return;
    }

    const subtask = subtaskResult[0];

    // Don't notify the user who made the change
    if (subtask.assignedTo === changedBy) {
      return;
    }

    await this.createNotification({
      userId: subtask.assignedTo,
      projectId: subtask.projectId,
      relatedEntityType: "subtask",
      relatedEntityId: subtaskId,
      type: "status_change",
      title: "Subtask Status Changed",
      message: `Subtask "${subtask.title}" status changed from ${oldStatusName} to ${newStatusName}`,
    });
  }

  /**
   * Create notifications for user mentions in comments
   * @param content - Comment content
   * @param projectId - Project ID
   * @param relatedEntityType - Entity type (task or subtask)
   * @param relatedEntityId - Entity ID
   * @param authorId - Comment author ID
   */
  async createMentionNotifications(
    content: string,
    projectId: string,
    relatedEntityType: "task" | "subtask",
    relatedEntityId: string,
    authorId: string
  ): Promise<void> {
    // Extract mentions from content (format: @username or @userId)
    // Simple regex to find @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (!mentions || mentions.length === 0) {
      return;
    }

    // Get entity title
    let entityTitle = "";
    if (relatedEntityType === "task") {
      const taskResult = await db
        .select({ title: tasks.title })
        .from(tasks)
        .where(eq(tasks.id, relatedEntityId))
        .limit(1);
      if (taskResult.length > 0) {
        entityTitle = taskResult[0].title;
      }
    } else {
      const subtaskResult = await db
        .select({ title: subtasks.title })
        .from(subtasks)
        .where(eq(subtasks.id, relatedEntityId))
        .limit(1);
      if (subtaskResult.length > 0) {
        entityTitle = subtaskResult[0].title;
      }
    }

    // Get project members to validate mentions
    const members = await projectService.listMembers(projectId, authorId);
    const memberUserIds = members
      .filter((m) => m.userId !== null)
      .map((m) => m.userId as string);

    // For each unique mention, create a notification
    const uniqueMentions = [...new Set(mentions)];
    for (const mention of uniqueMentions) {
      const username = mention.substring(1); // Remove @ symbol

      // Try to find user by username or ID
      // For now, we'll assume the mention is a userId
      // In a real implementation, you'd look up users by username
      if (memberUserIds.includes(username) && username !== authorId) {
        await this.createNotification({
          userId: username,
          projectId,
          relatedEntityType,
          relatedEntityId,
          type: "mention",
          title: "You were mentioned",
          message: `You were mentioned in a comment on ${relatedEntityType}: ${entityTitle}`,
        });
      }
    }
  }

  /**
   * List notifications for a user
   * @param userId - User ID
   * @param unreadOnly - Whether to return only unread notifications
   * @returns List of notifications
   */
  async listNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const conditions: any[] = [eq(notifications.userId, userId)];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(sql`${notifications.createdAt} DESC`);

    return result;
  }

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @param userId - User ID (for authorization)
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Get notification to verify ownership
    const notificationResult = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (notificationResult.length === 0) {
      throw new NotificationError(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        "Notification not found",
        404
      );
    }

    const notification = notificationResult[0];

    // Verify the notification belongs to the user
    if (notification.userId !== userId) {
      throw new NotificationError(
        NotificationErrorCode.FORBIDDEN,
        "You do not have access to this notification",
        403
      );
    }

    // Mark as read
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
