import { and, comments, db, eq, sql, subtasks, tasks } from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Comment with relations
 */
export interface Comment {
  id: string;
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  parentCommentId: string | null;
  authorId: string;
  content: string;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

/**
 * Input for creating a comment
 */
export interface CreateCommentInput {
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  parentCommentId?: string;
  content: string;
}

/**
 * Comment error codes
 */
export enum CommentErrorCode {
  COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND",
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  SUBTASK_NOT_FOUND = "SUBTASK_NOT_FOUND",
  PARENT_COMMENT_NOT_FOUND = "PARENT_COMMENT_NOT_FOUND",
  INVALID_PARENT_COMMENT = "INVALID_PARENT_COMMENT",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  EMPTY_CONTENT = "EMPTY_CONTENT",
}

/**
 * Comment error class
 */
export class CommentError extends Error {
  constructor(
    public code: CommentErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "CommentError";
  }
}

/**
 * Comment Service
 * Handles comment creation, updates, deletion with threading support
 */
export class CommentService {
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
        throw new CommentError(
          CommentErrorCode.TASK_NOT_FOUND,
          "Task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new CommentError(
          CommentErrorCode.FORBIDDEN,
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
        throw new CommentError(
          CommentErrorCode.SUBTASK_NOT_FOUND,
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
        throw new CommentError(
          CommentErrorCode.TASK_NOT_FOUND,
          "Parent task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new CommentError(
          CommentErrorCode.FORBIDDEN,
          "You do not have access to this subtask",
          403
        );
      }

      return projectId;
    }
  }

  /**
   * Create a new comment
   * @param data - Comment creation data
   * @param userId - ID of the user creating the comment
   * @returns Created comment
   */
  async createComment(
    data: CreateCommentInput,
    userId: string
  ): Promise<Comment> {
    // Validate content is not empty
    if (!data.content || data.content.trim().length === 0) {
      throw new CommentError(
        CommentErrorCode.EMPTY_CONTENT,
        "Comment content cannot be empty",
        400
      );
    }

    // Validate entity access and that author is project member
    await this.validateEntityAccess(
      data.relatedEntityType,
      data.relatedEntityId,
      userId
    );

    // If parent comment is specified, validate it exists and belongs to same entity
    if (data.parentCommentId) {
      const parentResult = await db
        .select()
        .from(comments)
        .where(eq(comments.id, data.parentCommentId))
        .limit(1);

      if (parentResult.length === 0) {
        throw new CommentError(
          CommentErrorCode.PARENT_COMMENT_NOT_FOUND,
          "Parent comment not found",
          404
        );
      }

      const parent = parentResult[0];
      if (
        parent.relatedEntityType !== data.relatedEntityType ||
        parent.relatedEntityId !== data.relatedEntityId
      ) {
        throw new CommentError(
          CommentErrorCode.INVALID_PARENT_COMMENT,
          "Parent comment must belong to the same task or subtask",
          400
        );
      }
    }

    const result = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        parentCommentId: data.parentCommentId || null,
        authorId: userId,
        content: data.content,
        editedAt: null,
      })
      .returning();

    return result[0];
  }

  /**
   * Reply to a comment
   * @param commentId - Parent comment ID
   * @param content - Reply content
   * @param userId - User ID creating the reply
   * @returns Created reply comment
   */
  async replyToComment(
    commentId: string,
    content: string,
    userId: string
  ): Promise<Comment> {
    // Get parent comment
    const parentResult = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (parentResult.length === 0) {
      throw new CommentError(
        CommentErrorCode.COMMENT_NOT_FOUND,
        "Comment not found",
        404
      );
    }

    const parent = parentResult[0];

    // Create reply using createComment
    return this.createComment(
      {
        relatedEntityType: parent.relatedEntityType,
        relatedEntityId: parent.relatedEntityId,
        parentCommentId: commentId,
        content,
      },
      userId
    );
  }

  /**
   * Update a comment
   * @param commentId - Comment ID
   * @param content - New content
   * @param userId - User ID requesting the update
   * @returns Updated comment
   */
  async updateComment(
    commentId: string,
    content: string,
    userId: string
  ): Promise<Comment> {
    // Validate content is not empty
    if (!content || content.trim().length === 0) {
      throw new CommentError(
        CommentErrorCode.EMPTY_CONTENT,
        "Comment content cannot be empty",
        400
      );
    }

    // Get comment
    const commentResult = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentResult.length === 0) {
      throw new CommentError(
        CommentErrorCode.COMMENT_NOT_FOUND,
        "Comment not found",
        404
      );
    }

    const comment = commentResult[0];

    // Validate access to the related entity
    await this.validateEntityAccess(
      comment.relatedEntityType,
      comment.relatedEntityId,
      userId
    );

    // Only the author can update the comment
    if (comment.authorId !== userId) {
      throw new CommentError(
        CommentErrorCode.FORBIDDEN,
        "You can only update your own comments",
        403
      );
    }

    const result = await db
      .update(comments)
      .set({
        content,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result[0];
  }

  /**
   * Delete a comment (cascades to replies)
   * @param commentId - Comment ID
   * @param userId - User ID requesting deletion
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // Get comment
    const commentResult = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentResult.length === 0) {
      throw new CommentError(
        CommentErrorCode.COMMENT_NOT_FOUND,
        "Comment not found",
        404
      );
    }

    const comment = commentResult[0];

    // Validate access to the related entity
    await this.validateEntityAccess(
      comment.relatedEntityType,
      comment.relatedEntityId,
      userId
    );

    // Only the author can delete the comment
    if (comment.authorId !== userId) {
      throw new CommentError(
        CommentErrorCode.FORBIDDEN,
        "You can only delete your own comments",
        403
      );
    }

    // Delete comment (cascade will handle replies)
    await db.delete(comments).where(eq(comments.id, commentId));
  }

  /**
   * List comments for a task or subtask with nested structure
   * @param relatedEntityType - Type of entity (task or subtask)
   * @param relatedEntityId - Entity ID
   * @param userId - User ID requesting the list
   * @returns List of top-level comments with nested replies
   */
  async listComments(
    relatedEntityType: "task" | "subtask",
    relatedEntityId: string,
    userId: string
  ): Promise<Comment[]> {
    // Validate access
    await this.validateEntityAccess(relatedEntityType, relatedEntityId, userId);

    // Get all comments for this entity
    const allComments = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.relatedEntityType, relatedEntityType),
          eq(comments.relatedEntityId, relatedEntityId)
        )
      )
      .orderBy(sql`${comments.createdAt} ASC`);

    // Build nested structure
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create map of all comments
    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    // Second pass: build tree structure
    for (const comment of allComments) {
      const commentWithReplies = commentMap.get(comment.id)!;

      if (comment.parentCommentId) {
        // This is a reply, add to parent's replies
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentWithReplies);
      }
    }

    return topLevelComments;
  }

  /**
   * Get a comment thread (comment and all its replies)
   * @param commentId - Comment ID
   * @param userId - User ID requesting the thread
   * @returns Comment with nested replies
   */
  async getCommentThread(
    commentId: string,
    userId: string
  ): Promise<Comment | null> {
    // Get the comment
    const commentResult = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentResult.length === 0) {
      return null;
    }

    const comment = commentResult[0];

    // Validate access
    try {
      await this.validateEntityAccess(
        comment.relatedEntityType,
        comment.relatedEntityId,
        userId
      );
    } catch (error) {
      return null;
    }

    // Get all replies recursively
    const allReplies = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, commentId))
      .orderBy(sql`${comments.createdAt} ASC`);

    // Build nested structure for replies
    const commentMap = new Map<string, Comment>();
    commentMap.set(comment.id, { ...comment, replies: [] });

    // Add all replies to map
    for (const reply of allReplies) {
      commentMap.set(reply.id, { ...reply, replies: [] });
    }

    // Build tree structure
    for (const reply of allReplies) {
      const replyWithReplies = commentMap.get(reply.id)!;
      if (reply.parentCommentId) {
        const parent = commentMap.get(reply.parentCommentId);
        if (parent) {
          parent.replies!.push(replyWithReplies);
        }
      }
    }

    return commentMap.get(comment.id)!;
  }
}

// Export singleton instance
export const commentService = new CommentService();
