import { and, db, eq, or, taskLinks, tasks } from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Task link with relations
 */
export interface TaskLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  linkType:
    | "blocks"
    | "blocked_by"
    | "depends_on"
    | "dependency_of"
    | "relates_to"
    | "duplicates"
    | "duplicated_by";
  createdBy: string;
  createdAt: Date;
}

/**
 * Task link type
 */
export type TaskLinkType =
  | "blocks"
  | "blocked_by"
  | "depends_on"
  | "dependency_of"
  | "relates_to"
  | "duplicates"
  | "duplicated_by";

/**
 * Task link error codes
 */
export enum TaskLinkErrorCode {
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  LINK_NOT_FOUND = "LINK_NOT_FOUND",
  INVALID_LINK_TYPE = "INVALID_LINK_TYPE",
  SAME_TASK_LINK = "SAME_TASK_LINK",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

/**
 * Task link error class
 */
export class TaskLinkError extends Error {
  constructor(
    public code: TaskLinkErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TaskLinkError";
  }
}

/**
 * Get the inverse link type for directional links
 */
function getInverseLinkType(linkType: TaskLinkType): TaskLinkType | null {
  const inverseMap: Record<string, TaskLinkType> = {
    blocks: "blocked_by",
    blocked_by: "blocks",
    depends_on: "dependency_of",
    dependency_of: "depends_on",
    duplicates: "duplicated_by",
    duplicated_by: "duplicates",
  };

  return inverseMap[linkType] || null;
}

/**
 * Task Link Service
 * Handles task linking and relationship management
 */
export class TaskLinkService {
  /**
   * Create a task link
   * @param sourceTaskId - Source task ID
   * @param targetTaskId - Target task ID
   * @param linkType - Type of link
   * @param userId - User ID creating the link
   */
  async createLink(
    sourceTaskId: string,
    targetTaskId: string,
    linkType: TaskLinkType,
    userId: string
  ): Promise<void> {
    // Validate that source and target are different
    if (sourceTaskId === targetTaskId) {
      throw new TaskLinkError(
        TaskLinkErrorCode.SAME_TASK_LINK,
        "Cannot link a task to itself",
        400
      );
    }

    // Validate link type
    const validLinkTypes: TaskLinkType[] = [
      "blocks",
      "blocked_by",
      "depends_on",
      "dependency_of",
      "relates_to",
      "duplicates",
      "duplicated_by",
    ];

    if (!validLinkTypes.includes(linkType)) {
      throw new TaskLinkError(
        TaskLinkErrorCode.INVALID_LINK_TYPE,
        "Invalid link type",
        400
      );
    }

    // Get source task and check access
    const sourceTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, sourceTaskId))
      .limit(1);

    if (sourceTask.length === 0) {
      throw new TaskLinkError(
        TaskLinkErrorCode.TASK_NOT_FOUND,
        "Source task not found",
        404
      );
    }

    // Get target task and check access
    const targetTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, targetTaskId))
      .limit(1);

    if (targetTask.length === 0) {
      throw new TaskLinkError(
        TaskLinkErrorCode.TASK_NOT_FOUND,
        "Target task not found",
        404
      );
    }

    // Check access to source task's project
    const hasSourceAccess = await projectService.checkAccess(
      sourceTask[0].projectId,
      userId
    );
    if (!hasSourceAccess) {
      throw new TaskLinkError(
        TaskLinkErrorCode.FORBIDDEN,
        "You do not have access to the source task's project",
        403
      );
    }

    // Check access to target task's project
    const hasTargetAccess = await projectService.checkAccess(
      targetTask[0].projectId,
      userId
    );
    if (!hasTargetAccess) {
      throw new TaskLinkError(
        TaskLinkErrorCode.FORBIDDEN,
        "You do not have access to the target task's project",
        403
      );
    }

    // Create the primary link
    await db.insert(taskLinks).values({
      id: crypto.randomUUID(),
      sourceTaskId,
      targetTaskId,
      linkType,
      createdBy: userId,
    });

    // Create inverse link for directional link types
    const inverseLinkType = getInverseLinkType(linkType);
    if (inverseLinkType) {
      await db.insert(taskLinks).values({
        id: crypto.randomUUID(),
        sourceTaskId: targetTaskId,
        targetTaskId: sourceTaskId,
        linkType: inverseLinkType,
        createdBy: userId,
      });
    }
  }

  /**
   * Delete a task link
   * @param linkId - Link ID
   * @param userId - User ID deleting the link
   */
  async deleteLink(linkId: string, userId: string): Promise<void> {
    // Get the link
    const linkResult = await db
      .select()
      .from(taskLinks)
      .where(eq(taskLinks.id, linkId))
      .limit(1);

    if (linkResult.length === 0) {
      throw new TaskLinkError(
        TaskLinkErrorCode.LINK_NOT_FOUND,
        "Link not found",
        404
      );
    }

    const link = linkResult[0];

    // Get source task to check access
    const sourceTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, link.sourceTaskId))
      .limit(1);

    if (sourceTask.length === 0) {
      throw new TaskLinkError(
        TaskLinkErrorCode.TASK_NOT_FOUND,
        "Source task not found",
        404
      );
    }

    // Check access
    const hasAccess = await projectService.checkAccess(
      sourceTask[0].projectId,
      userId
    );
    if (!hasAccess) {
      throw new TaskLinkError(
        TaskLinkErrorCode.FORBIDDEN,
        "You do not have access to this task's project",
        403
      );
    }

    // Delete the link
    await db.delete(taskLinks).where(eq(taskLinks.id, linkId));

    // Delete inverse link if it exists
    const inverseLinkType = getInverseLinkType(link.linkType);
    if (inverseLinkType) {
      await db
        .delete(taskLinks)
        .where(
          and(
            eq(taskLinks.sourceTaskId, link.targetTaskId),
            eq(taskLinks.targetTaskId, link.sourceTaskId),
            eq(taskLinks.linkType, inverseLinkType)
          )
        );
    }
  }

  /**
   * List all links for a task
   * @param taskId - Task ID
   * @param userId - User ID requesting the list
   * @returns List of task links
   */
  async listLinks(taskId: string, userId: string): Promise<TaskLink[]> {
    // Get task and check access
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task.length === 0) {
      throw new TaskLinkError(
        TaskLinkErrorCode.TASK_NOT_FOUND,
        "Task not found",
        404
      );
    }

    // Check access
    const hasAccess = await projectService.checkAccess(
      task[0].projectId,
      userId
    );
    if (!hasAccess) {
      throw new TaskLinkError(
        TaskLinkErrorCode.FORBIDDEN,
        "You do not have access to this task's project",
        403
      );
    }

    // Get all links where task is source or target
    const links = await db
      .select()
      .from(taskLinks)
      .where(
        or(
          eq(taskLinks.sourceTaskId, taskId),
          eq(taskLinks.targetTaskId, taskId)
        )
      );

    return links;
  }
}

// Export singleton instance
export const taskLinkService = new TaskLinkService();
