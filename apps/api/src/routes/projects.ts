import { Elysia, t } from "elysia";
import { config } from "../config";
import { rateLimit } from "../middleware/rate-limit";
import {
  ProjectError,
  ProjectErrorCode,
  projectService,
} from "../services/project.service";

/**
 * Project routes plugin
 * Provides endpoints for project management, status updates, and member management
 */
export const projectRoutes = new Elysia({ prefix: "/projects" })
  .decorate("authenticated", false as boolean)
  .decorate("userId", null as string | null)
  .decorate("sessionId", null as string | null)
  .decorate("accessToken", null as string | null)
  // Apply rate limiting to all project endpoints
  .onBeforeHandle(
    rateLimit({
      max: config.API_RATE_LIMIT,
      window: config.API_RATE_WINDOW,
      endpoint: "projects",
    })
  )
  .onError(({ code, error, set }) => {
    // Handle ProjectError
    if (error instanceof ProjectError) {
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
    console.error("Unexpected error in project routes:", error);
    set.status = 500;
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  })
  // POST /projects - Create a new project
  .post(
    "/",
    async ({ body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const project = await projectService.createProject(body, userId);

      return {
        project,
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 200 }),
        description: t.Optional(t.String({ maxLength: 2000 })),
        workflowId: t.String(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Create a new project",
        description: `
Create a new project with a selected workflow.

**Authentication Required:**
- Must include valid access token in Authorization header

**Workflow Selection:**
- Must provide a valid workflow ID
- Workflow can be a predefined template or custom workflow
- Workflow cannot be changed after project creation (immutable)

**Project Ownership:**
- Creating user becomes the project owner
- Only the owner can manage project settings and membership
- Owner has full access to all project content

**Requirements:**
- Project name must be 1-200 characters
- Description is optional (max 2000 characters)
- Workflow must exist and be accessible

**Response:**
- Created project object with ID, metadata, and initial status (active)
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Project created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "proj_123" },
                        name: { type: "string", example: "My Project" },
                        description: {
                          type: "string",
                          example: "Project description",
                        },
                        ownerId: { type: "string", example: "user_123" },
                        workflowId: { type: "string", example: "wf_123" },
                        status: {
                          type: "string",
                          enum: ["active", "archived", "on_hold", "completed"],
                          example: "active",
                        },
                        statusUpdatedAt: {
                          type: "string",
                          format: "date-time",
                        },
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
          404: {
            description: "Workflow not found",
          },
        },
      },
    }
  )
  // GET /projects - List projects
  .get(
    "/",
    async ({ query, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const { status, limit, offset, sortBy, sortDirection } = query;

      // Convert status to the correct type or null for all projects
      const statusFilter = status === "all" ? null : status;

      const projects = await projectService.listProjects(userId, statusFilter, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        sortBy,
        sortDirection,
      });

      return {
        projects,
      };
    },
    {
      query: t.Object({
        status: t.Optional(
          t.Union([
            t.Literal("active"),
            t.Literal("archived"),
            t.Literal("on_hold"),
            t.Literal("completed"),
            t.Literal("all"),
          ])
        ),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortDirection: t.Optional(
          t.Union([t.Literal("asc"), t.Literal("desc")])
        ),
      }),
      detail: {
        tags: ["Projects"],
        summary: "List projects",
        description: `
List all projects accessible to the authenticated user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Returned Projects:**
- Projects where user is the owner
- Projects where user is a direct member
- Projects where user is a member through a user group

**Filtering:**
- Use \`status\` query parameter to filter by project status
- Omit \`status\` or use \`active\` to get only active projects (default)
- Use \`all\` to get projects regardless of status
- Archived projects are excluded by default (Requirement 14.1)

**Status Values:**
- \`active\`: Currently active projects
- \`archived\`: Archived projects (read-only, no new tasks)
- \`on_hold\`: Projects temporarily paused
- \`completed\`: Completed projects
- \`all\`: All projects regardless of status

**Pagination:**
- \`limit\`: Maximum number of projects to return (default: 50, max: 100)
- \`offset\`: Number of projects to skip (default: 0)

**Sorting:**
- \`sortBy\`: Field to sort by (e.g., 'name', 'createdAt', 'updatedAt')
- \`sortDirection\`: Sort direction ('asc' or 'desc', default: 'asc')

**Response:**
- Array of project objects
- Each project includes basic metadata
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of projects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    projects: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          ownerId: { type: "string" },
                          workflowId: { type: "string" },
                          status: {
                            type: "string",
                            enum: [
                              "active",
                              "archived",
                              "on_hold",
                              "completed",
                            ],
                          },
                          statusUpdatedAt: {
                            type: "string",
                            format: "date-time",
                          },
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
        },
      },
    }
  )
  // GET /projects/:id - Get project details
  .get(
    "/:id",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const project = await projectService.getProject(params.id, userId);

      if (!project) {
        throw new ProjectError(
          ProjectErrorCode.PROJECT_NOT_FOUND,
          "Project not found or access denied",
          404
        );
      }

      return {
        project,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Get project details",
        description: `
Get detailed information about a specific project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be the project owner or a member
- Returns 404 if project doesn't exist or user has no access

**Response:**
- Complete project object with all metadata
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Project details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string" },
                        workflowId: { type: "string" },
                        status: {
                          type: "string",
                          enum: ["active", "archived", "on_hold", "completed"],
                        },
                        statusUpdatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
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
          404: {
            description: "Project not found or access denied",
          },
        },
      },
    }
  )
  // PUT /projects/:id - Update project details
  .put(
    "/:id",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const project = await projectService.updateProject(
        params.id,
        body,
        userId
      );

      return {
        project,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        description: t.Optional(t.String({ maxLength: 2000 })),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Update project details",
        description: `
Update project name and/or description.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the project owner can update project details
- Returns 403 if user is not the owner

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Changes are logged in the activity log
- Workflow cannot be changed (immutable after creation)

**Response:**
- Updated project object with new values
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Project updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string" },
                        workflowId: { type: "string" },
                        status: {
                          type: "string",
                          enum: ["active", "archived", "on_hold", "completed"],
                        },
                        statusUpdatedAt: {
                          type: "string",
                          format: "date-time",
                        },
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
            description: "Validation error or workflow immutability violation",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to update this project",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    }
  )
  // DELETE /projects/:id - Delete a project
  .delete(
    "/:id",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await projectService.deleteProject(params.id, userId);

      return {
        message: "Project deleted successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Delete a project",
        description: `
Delete a project and all associated content.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the project owner can delete the project
- Returns 403 if user is not the owner

**Cascade Deletion:**
- All tasks and subtasks are deleted
- All comments and attachments are deleted
- All project members are removed
- Activity logs are preserved for audit purposes

**Response:**
- Success message on successful deletion
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Project deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Project deleted successfully",
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
            description: "Not authorized to delete this project",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    }
  )
  // PATCH /projects/:id/status - Update project status
  .patch(
    "/:id/status",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const project = await projectService.updateProjectStatus(
        params.id,
        body.status,
        userId
      );

      return {
        project,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal("active"),
          t.Literal("archived"),
          t.Literal("on_hold"),
          t.Literal("completed"),
        ]),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Update project status",
        description: `
Update the status of a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the project owner can change project status
- Returns 403 if user is not the owner

**Status Values:**
- \`active\`: Project is currently active
- \`archived\`: Project is archived (read-only, no new tasks can be created)
- \`on_hold\`: Project is temporarily paused
- \`completed\`: Project is completed

**Archived Projects:**
- Existing data is preserved
- No new tasks can be created
- Existing tasks can still be viewed
- Excluded from default project listings

**Response:**
- Updated project object with new status and timestamp
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Project status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string" },
                        workflowId: { type: "string" },
                        status: {
                          type: "string",
                          enum: ["active", "archived", "on_hold", "completed"],
                        },
                        statusUpdatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
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
            description: "Not authorized to change project status",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    }
  )
  // POST /projects/:id/members - Add a member to a project
  .post(
    "/:id/members",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await projectService.addMember(params.id, body, userId);

      return {
        message: "Member added successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.Optional(t.String()),
        userGroupId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Add a member to a project",
        description: `
Add a user or user group as a member of a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the project owner can add members
- Returns 403 if user is not the owner

**Member Types:**
- Provide \`userId\` to add an individual user
- Provide \`userGroupId\` to add a user group (all group members gain access)
- Must provide exactly one (cannot provide both)

**Access Granted:**
- Members can view all project content
- Members can create and modify tasks
- Members can be assigned to tasks
- Members cannot manage project settings or membership

**Response:**
- Success message on successful addition
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Member added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Member added successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input (must provide userId or userGroupId)",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to add members",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    }
  )
  // DELETE /projects/:id/members/:memberId - Remove a member from a project
  .delete(
    "/:id/members/:memberId",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await projectService.removeMember(params.id, params.memberId, userId);

      return {
        message: "Member removed successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
        memberId: t.String(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "Remove a member from a project",
        description: `
Remove a user or user group from project membership.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the project owner can remove members
- Returns 403 if user is not the owner

**Access Revocation:**
- Member immediately loses access to all project content
- If removing a user group, all group members lose access
- Existing task assignments are not automatically removed

**Response:**
- Success message on successful removal
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Member removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Member removed successfully",
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
            description: "Not authorized to remove members",
          },
          404: {
            description: "Project or member not found",
          },
        },
      },
    }
  )
  // GET /projects/:id/members - List project members
  .get(
    "/:id/members",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new ProjectError(
          ProjectErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const members = await projectService.listMembers(params.id, userId);

      return {
        members,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Projects"],
        summary: "List project members",
        description: `
Get a list of all members (users and user groups) for a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be the project owner or a member
- Returns 403 if user has no access to the project

**Response:**
- Array of member objects
- Each member includes user ID or user group ID
- Includes metadata about when and by whom the member was added
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of project members",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    members: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "member_123" },
                          projectId: { type: "string", example: "proj_123" },
                          userId: {
                            type: "string",
                            nullable: true,
                            example: "user_123",
                          },
                          userGroupId: {
                            type: "string",
                            nullable: true,
                            example: "group_123",
                          },
                          addedBy: { type: "string", example: "user_123" },
                          addedAt: {
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
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to view project members",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    }
  );
