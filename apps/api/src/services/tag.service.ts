import { and, db, eq, sql, tags, taskTags, tasks } from "@wingmnn/db";
import { projectService } from "./project.service";

/**
 * Tag with relations
 */
export interface Tag {
  id: string;
  name: string;
  description: string | null;
  colorCode: string;
  projectId: string;
  deleted: boolean | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a tag
 */
export interface CreateTagInput {
  name: string;
  description?: string;
  colorCode?: string;
  projectId: string;
}

/**
 * Input for updating a tag
 */
export interface UpdateTagInput {
  name?: string;
  description?: string;
  colorCode?: string;
}

/**
 * Tag error codes
 */
export enum TagErrorCode {
  TAG_NOT_FOUND = "TAG_NOT_FOUND",
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  DUPLICATE_TAG_NAME = "DUPLICATE_TAG_NAME",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_INPUT = "INVALID_INPUT",
}

/**
 * Tag error class
 */
export class TagError extends Error {
  constructor(
    public code: TagErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TagError";
  }
}

/**
 * Tag Service
 * Handles tag management and task-tag associations
 */
export class TagService {
  /**
   * Create a new tag
   * @param data - Tag creation data
   * @param userId - ID of the user creating the tag
   * @returns Created tag
   */
  async createTag(data: CreateTagInput, userId: string): Promise<Tag> {
    // Check project access
    const hasAccess = await projectService.checkAccess(data.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Check for duplicate tag name in the project
    const existingTag = await db
      .select()
      .from(tags)
      .where(and(eq(tags.projectId, data.projectId), eq(tags.name, data.name)))
      .limit(1);

    if (existingTag.length > 0) {
      throw new TagError(
        TagErrorCode.DUPLICATE_TAG_NAME,
        "A tag with this name already exists in the project",
        409
      );
    }

    const result = await db
      .insert(tags)
      .values({
        name: data.name,
        description: data.description || null,
        colorCode: data.colorCode || "#ffffff",
        projectId: data.projectId,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a tag by ID
   * @param tagId - Tag ID
   * @param userId - User ID requesting the tag
   * @returns Tag or null if not found or no access
   */
  async getTag(tagId: string, userId: string): Promise<Tag | null> {
    const result = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const tag = result[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(tag.projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return tag;
  }

  /**
   * List tags for a project
   * @param projectId - Project ID
   * @param userId - User ID requesting the list
   * @returns List of tags
   */
  async listTags(projectId: string, userId: string): Promise<Tag[]> {
    // Check project access
    const hasAccess = await projectService.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    const result = await db
      .select()
      .from(tags)
      .where(eq(tags.projectId, projectId));

    return result;
  }

  /**
   * Update a tag
   * @param tagId - Tag ID
   * @param data - Tag update data
   * @param userId - User ID requesting the update
   * @returns Updated tag
   */
  async updateTag(
    tagId: string,
    data: UpdateTagInput,
    userId: string
  ): Promise<Tag> {
    // Get the tag to check project access
    const existingTag = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (existingTag.length === 0) {
      throw new TagError(TagErrorCode.TAG_NOT_FOUND, "Tag not found", 404);
    }

    const tag = existingTag[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(tag.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Check for duplicate tag name if name is being updated
    if (data.name && data.name !== tag.name) {
      const duplicateTag = await db
        .select()
        .from(tags)
        .where(
          and(
            eq(tags.projectId, tag.projectId),
            eq(tags.name, data.name),
            sql`${tags.id} != ${tagId}`
          )
        )
        .limit(1);

      if (duplicateTag.length > 0) {
        throw new TagError(
          TagErrorCode.DUPLICATE_TAG_NAME,
          "A tag with this name already exists in the project",
          409
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: userId,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;

    const result = await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, tagId))
      .returning();

    return result[0];
  }

  /**
   * Delete a tag
   * @param tagId - Tag ID
   * @param userId - User ID requesting deletion
   */
  async deleteTag(tagId: string, userId: string): Promise<void> {
    // Get the tag to check project access
    const existingTag = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (existingTag.length === 0) {
      throw new TagError(TagErrorCode.TAG_NOT_FOUND, "Tag not found", 404);
    }

    const tag = existingTag[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(tag.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Delete tag (cascade will handle task associations)
    await db.delete(tags).where(eq(tags.id, tagId));
  }

  /**
   * Add a tag to a task
   * @param taskId - Task ID
   * @param tagId - Tag ID
   * @param userId - User ID adding the tag
   */
  async addTagToTask(
    taskId: string,
    tagId: string,
    userId: string
  ): Promise<void> {
    // Get the task to check project access
    const taskResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0) {
      throw new TagError(TagErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    const task = taskResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Verify tag exists and belongs to the same project
    const tagResult = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (tagResult.length === 0) {
      throw new TagError(TagErrorCode.TAG_NOT_FOUND, "Tag not found", 404);
    }

    const tag = tagResult[0];

    if (tag.projectId !== task.projectId) {
      throw new TagError(
        TagErrorCode.INVALID_INPUT,
        "Tag must belong to the same project as the task",
        400
      );
    }

    // Check if association already exists
    const existingAssociation = await db
      .select()
      .from(taskTags)
      .where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)))
      .limit(1);

    if (existingAssociation.length > 0) {
      // Association already exists, no need to add again
      return;
    }

    // Create the association
    await db.insert(taskTags).values({
      taskId,
      tagId,
    });
  }

  /**
   * Remove a tag from a task
   * @param taskId - Task ID
   * @param tagId - Tag ID
   * @param userId - User ID removing the tag
   */
  async removeTagFromTask(
    taskId: string,
    tagId: string,
    userId: string
  ): Promise<void> {
    // Get the task to check project access
    const taskResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0) {
      throw new TagError(TagErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    const task = taskResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Remove the association
    await db
      .delete(taskTags)
      .where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)));
  }

  /**
   * List tags for a task
   * @param taskId - Task ID
   * @param userId - User ID requesting the list
   * @returns List of tags
   */
  async listTaskTags(taskId: string, userId: string): Promise<Tag[]> {
    // Get the task to check project access
    const taskResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskResult.length === 0) {
      throw new TagError(TagErrorCode.TASK_NOT_FOUND, "Task not found", 404);
    }

    const task = taskResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Get all tags for the task
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
        colorCode: tags.colorCode,
        projectId: tags.projectId,
        deleted: tags.deleted,
        createdBy: tags.createdBy,
        updatedBy: tags.updatedBy,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      })
      .from(tags)
      .innerJoin(taskTags, eq(taskTags.tagId, tags.id))
      .where(eq(taskTags.taskId, taskId));

    return result;
  }

  /**
   * List tasks with a specific tag
   * @param tagId - Tag ID
   * @param userId - User ID requesting the list
   * @returns List of task IDs
   */
  async listTasksByTag(tagId: string, userId: string): Promise<string[]> {
    // Get the tag to check project access
    const tagResult = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (tagResult.length === 0) {
      throw new TagError(TagErrorCode.TAG_NOT_FOUND, "Tag not found", 404);
    }

    const tag = tagResult[0];

    // Check project access
    const hasAccess = await projectService.checkAccess(tag.projectId, userId);
    if (!hasAccess) {
      throw new TagError(
        TagErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Get all tasks with this tag
    const result = await db
      .select({ taskId: taskTags.taskId })
      .from(taskTags)
      .where(eq(taskTags.tagId, tagId));

    return result.map((r) => r.taskId);
  }
}

// Export singleton instance
export const tagService = new TagService();
