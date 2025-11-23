import { Elysia, t } from "elysia";
import { TagError, TagErrorCode, tagService } from "../services/tag.service";

/**
 * Tag routes plugin
 * Provides endpoints for tag management and task-tag associations
 */
export const tagRoutes = new Elysia({ prefix: "/projects" })
  .decorate("authenticated", false as boolean)
  .decorate("userId", null as string | null)
  .decorate("sessionId", null as string | null)
  .decorate("accessToken", null as string | null)
  .onError(({ code, error, set }) => {
    // Handle TagError
    if (error instanceof TagError) {
      set.status = error.statusCode;
      return {
        error: error.code,
        message: error.message,
      };
    }

    // Handle validation errors
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid request data",
      };
    }

    // Handle NOT_FOUND errors
    if (String(code) === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "NOT_FOUND",
        message: "Resource not found",
      };
    }

    // Log unexpected errors
    console.error("Unexpected error in tag routes:", error);
    set.status = 500;
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  })
  // POST /projects/:projectId/tags - Create a new tag
  .post(
    "/:projectId/tags",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const tag = await tagService.createTag(
        {
          ...body,
          projectId: params.projectId,
        },
        userId
      );

      return {
        tag,
      };
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        description: t.Optional(t.String({ maxLength: 500 })),
        colorCode: t.Optional(t.String({ pattern: "^#[0-9A-Fa-f]{6}$" })),
      }),
      detail: {
        tags: ["Tags"],
        summary: "Create a new tag",
        description: `
Create a new tag within a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be a member of the project
- Returns 403 if user has no access to the project

**Tag Creation:**
- Tag name must be unique within the project
- Color code defaults to #ffffff if not provided
- Color code must be a valid hex color (e.g., #FF5733)

**Requirements:**
- Tag name must be 1-100 characters
- Description is optional (max 500 characters)
- Color code must be in hex format (#RRGGBB)

**Response:**
- Created tag object with ID and all metadata

**Validates:**
- Requirements 11.1: Tag creation with all fields
- Requirements 11.6: Tag names are unique per project
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Tag created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tag: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "tag_123" },
                        name: { type: "string", example: "Bug" },
                        description: {
                          type: "string",
                          example: "Bug fixes and issues",
                        },
                        colorCode: { type: "string", example: "#FF5733" },
                        projectId: { type: "string", example: "proj_123" },
                        createdBy: { type: "string", example: "user_123" },
                        updatedBy: { type: "string", example: "user_123" },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to create tags in this project",
          },
          409: {
            description: "Tag name already exists in this project",
          },
        },
      },
    }
  )
  // GET /projects/:projectId/tags - List tags for a project
  .get(
    "/:projectId/tags",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const tags = await tagService.listTags(params.projectId, userId);

      return {
        tags,
      };
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      detail: {
        tags: ["Tags"],
        summary: "List tags for a project",
        description: `
Get all tags for a specific project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the project
- Returns 403 if user has no access to the project

**Response:**
- Array of tag objects for the project
- Tags are ordered by creation date
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of tags",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tags: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          colorCode: { type: "string" },
                          projectId: { type: "string" },
                          createdBy: { type: "string" },
                          updatedBy: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to view tags in this project",
          },
        },
      },
    }
  )
  // PUT /projects/:projectId/tags/:tagId - Update a tag
  .put(
    "/:projectId/tags/:tagId",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const tag = await tagService.updateTag(params.tagId, body, userId);

      return {
        tag,
      };
    },
    {
      params: t.Object({
        projectId: t.String(),
        tagId: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        description: t.Optional(t.String({ maxLength: 500 })),
        colorCode: t.Optional(t.String({ pattern: "^#[0-9A-Fa-f]{6}$" })),
      }),
      detail: {
        tags: ["Tags"],
        summary: "Update a tag",
        description: `
Update tag properties.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the project
- Returns 403 if user has no access to the project

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Tag name must remain unique within the project
- Color code must be a valid hex color if provided

**Response:**
- Updated tag object with new values
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Tag updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tag: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        colorCode: { type: "string" },
                        projectId: { type: "string" },
                        createdBy: { type: "string" },
                        updatedBy: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to update tags in this project",
          },
          404: {
            description: "Tag not found",
          },
          409: {
            description: "Tag name already exists in this project",
          },
        },
      },
    }
  )
  // DELETE /projects/:projectId/tags/:tagId - Delete a tag
  .delete(
    "/:projectId/tags/:tagId",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await tagService.deleteTag(params.tagId, userId);

      return {
        message: "Tag deleted successfully",
      };
    },
    {
      params: t.Object({
        projectId: t.String(),
        tagId: t.String(),
      }),
      detail: {
        tags: ["Tags"],
        summary: "Delete a tag",
        description: `
Delete a tag from a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the project
- Returns 403 if user has no access to the project

**Cascade Deletion:**
- All task associations with this tag are removed
- Tag is permanently deleted from the database

**Response:**
- Success message on successful deletion

**Validates:**
- Requirements 11.4: Tag deletion cascades to associations
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Tag deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Tag deleted successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to delete tags in this project",
          },
          404: {
            description: "Tag not found",
          },
        },
      },
    }
  );

/**
 * Task tag routes plugin
 * Provides endpoints for managing task-tag associations
 */
export const taskTagRoutes = new Elysia({ prefix: "/tasks" })
  .decorate("authenticated", false as boolean)
  .decorate("userId", null as string | null)
  .decorate("sessionId", null as string | null)
  .decorate("accessToken", null as string | null)
  .onError(({ code, error, set }) => {
    // Handle TagError
    if (error instanceof TagError) {
      set.status = error.statusCode;
      return {
        error: error.code,
        message: error.message,
      };
    }

    // Handle validation errors
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid request data",
      };
    }

    // Handle NOT_FOUND errors
    if (String(code) === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "NOT_FOUND",
        message: "Resource not found",
      };
    }

    // Log unexpected errors
    console.error("Unexpected error in task tag routes:", error);
    set.status = 500;
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  })
  // POST /tasks/:taskId/tags - Add a tag to a task
  .post(
    "/:taskId/tags",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await tagService.addTagToTask(params.taskId, body.tagId, userId);

      return {
        message: "Tag added to task successfully",
      };
    },
    {
      params: t.Object({
        taskId: t.String(),
      }),
      body: t.Object({
        tagId: t.String(),
      }),
      detail: {
        tags: ["Tags"],
        summary: "Add a tag to a task",
        description: `
Associate a tag with a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 403 if user has no access to the project

**Validation:**
- Tag must belong to the same project as the task
- Returns 400 if tag and task are from different projects
- Returns 404 if task or tag doesn't exist

**Idempotent:**
- If the tag is already associated with the task, no error is returned
- Association is created only if it doesn't already exist

**Response:**
- Success message on successful association

**Validates:**
- Requirements 11.2: Tag association creates link
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Tag added to task successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Tag added to task successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Tag must belong to the same project as the task",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to modify this task",
          },
          404: {
            description: "Task or tag not found",
          },
        },
      },
    }
  )
  // DELETE /tasks/:taskId/tags/:tagId - Remove a tag from a task
  .delete(
    "/:taskId/tags/:tagId",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await tagService.removeTagFromTask(params.taskId, params.tagId, userId);

      return {
        message: "Tag removed from task successfully",
      };
    },
    {
      params: t.Object({
        taskId: t.String(),
        tagId: t.String(),
      }),
      detail: {
        tags: ["Tags"],
        summary: "Remove a tag from a task",
        description: `
Remove the association between a tag and a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 403 if user has no access to the project

**Idempotent:**
- If the tag is not associated with the task, no error is returned
- Association is removed only if it exists

**Response:**
- Success message on successful removal

**Validates:**
- Requirements 11.3: Tag removal deletes association
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Tag removed from task successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Tag removed from task successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to modify this task",
          },
          404: {
            description: "Task not found",
          },
        },
      },
    }
  )
  // GET /tasks/:taskId/tags - List tags for a task
  .get(
    "/:taskId/tags",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TagError(
          TagErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const tags = await tagService.listTaskTags(params.taskId, userId);

      return {
        tags,
      };
    },
    {
      params: t.Object({
        taskId: t.String(),
      }),
      detail: {
        tags: ["Tags"],
        summary: "List tags for a task",
        description: `
Get all tags associated with a specific task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 403 if user has no access to the project

**Response:**
- Array of tag objects associated with the task
- Empty array if task has no tags

**Validates:**
- Requirements 11.5: Tag filtering returns correct tasks (inverse operation)
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of tags for the task",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tags: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          colorCode: { type: "string" },
                          projectId: { type: "string" },
                          createdBy: { type: "string" },
                          updatedBy: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to view this task",
          },
          404: {
            description: "Task not found",
          },
        },
      },
    }
  );
