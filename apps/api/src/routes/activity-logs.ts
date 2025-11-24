import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	ActivityLogError,
	ActivityLogErrorCode,
	activityLogService,
} from "../services/activity-log.service";

/**
 * Activity log routes plugin
 * Provides endpoints for viewing activity logs across projects, tasks, and subtasks
 */
export const activityLogRoutes = new Elysia({ prefix: "/activity-logs" })
	.derive(auth)
	// Apply rate limiting to all activity log endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "activity-logs",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle ActivityLogError
		if (error instanceof ActivityLogError) {
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
		console.error("Unexpected error in activity log routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// GET /activity-logs - List activity logs with filters
	.get(
		"/",
		async ({ query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new ActivityLogError(
					ActivityLogErrorCode.FORBIDDEN,
					"Authentication required",
					401,
				);
			}

			// Parse query parameters
			const filters: any = {
				projectId: query.projectId,
				taskId: query.taskId,
				subtaskId: query.subtaskId,
				userId: query.userId,
				activityType: query.activityType,
				entityType: query.entityType,
				entityId: query.entityId,
				limit: query.limit ? parseInt(query.limit) : undefined,
				offset: query.offset ? parseInt(query.offset) : undefined,
			};

			// Parse date filters
			if (query.dateFrom) {
				filters.dateFrom = new Date(query.dateFrom);
			}
			if (query.dateTo) {
				filters.dateTo = new Date(query.dateTo);
			}

			const activities = await activityLogService.listActivities(
				filters,
				userId,
			);

			return {
				activities,
			};
		},
		{
			query: t.Object({
				projectId: t.Optional(t.String()),
				taskId: t.Optional(t.String()),
				subtaskId: t.Optional(t.String()),
				userId: t.Optional(t.String()),
				activityType: t.Optional(
					t.Union([
						t.Literal("create"),
						t.Literal("update"),
						t.Literal("delete"),
						t.Literal("status_change"),
						t.Literal("assignment_change"),
						t.Literal("comment_added"),
						t.Literal("attachment_added"),
						t.Literal("member_added"),
						t.Literal("member_removed"),
					]),
				),
				entityType: t.Optional(t.String()),
				entityId: t.Optional(t.String()),
				dateFrom: t.Optional(t.String()),
				dateTo: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Activity Logs"],
				summary: "List activity logs with filters",
				description: `
Get activity logs with optional filtering across projects, tasks, and subtasks.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only returns activity logs for projects the user has access to
- If no projectId is specified, returns logs from all accessible projects
- If projectId is specified, verifies user has access to that project
- Returns 403 if user attempts to access logs for projects they don't have access to

**Filtering:**
- \`projectId\`: Filter by specific project
- \`taskId\`: Filter by specific task
- \`subtaskId\`: Filter by specific subtask
- \`userId\`: Filter by user who performed the action
- \`activityType\`: Filter by type of activity (create, update, delete, status_change, assignment_change, comment_added, attachment_added, member_added, member_removed)
- \`entityType\`: Filter by entity type (project, task, subtask, comment, attachment, etc.)
- \`entityId\`: Filter by specific entity ID
- \`dateFrom\`: Filter by date (activities on or after this date)
- \`dateTo\`: Filter by date (activities on or before this date)

**Pagination:**
- \`limit\`: Maximum number of entries to return
- \`offset\`: Number of entries to skip

**Ordering:**
- Results are ordered by creation date in descending order (most recent first)

**Activity Log Structure:**
- Each log entry includes:
  - Timestamp of the activity
  - User who performed the action
  - Type of activity (create, update, delete, etc.)
  - Entity type and ID
  - Change details (for updates: old and new values)
  - Additional metadata

**Persistence:**
- Activity logs persist even after entities are deleted
- Provides complete audit trail for compliance and debugging

**Requirements:**
- Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5

**Use Cases:**
- View project history and changes
- Track who made specific changes
- Audit trail for compliance
- Debug issues by reviewing change history
- Monitor team activity
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of activity logs",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to access these activity logs",
					},
				},
			},
		},
	);

// Project-specific activity logs route
export const projectActivityRoutes = new Elysia()
	.decorate("authenticated", false as boolean)
	.decorate("userId", null as string | null)
	.decorate("sessionId", null as string | null)
	.decorate("accessToken", null as string | null)
	// Apply rate limiting to project activity endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "project-activity",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle ActivityLogError
		if (error instanceof ActivityLogError) {
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
		console.error("Unexpected error in project activity routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// GET /projects/:id/activity - Get activity logs for a specific project
	.get(
		"/projects/:id/activity",
		async ({ params, query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new ActivityLogError(
					ActivityLogErrorCode.FORBIDDEN,
					"Authentication required",
					401,
				);
			}

			// Parse pagination parameters
			const limit = query.limit ? parseInt(query.limit) : undefined;
			const offset = query.offset ? parseInt(query.offset) : undefined;

			const activities = await activityLogService.getProjectActivity(
				params.id,
				userId,
				limit,
				offset,
			);

			return {
				activities,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Projects"],
				summary: "Get activity logs for a project",
				description: `
Get all activity logs for a specific project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be the project owner or a project member
- Returns 403 if user has no access to the project
- Returns 404 if project doesn't exist

**Pagination:**
- \`limit\`: Maximum number of entries to return
- \`offset\`: Number of entries to skip

**Response:**
- Array of activity log entries for the project
- Includes all activities related to the project, its tasks, and subtasks
- Ordered by creation date (most recent first)

**Activity Types:**
- Project changes (status updates, member additions/removals)
- Task and subtask changes (creation, updates, deletions)
- Status changes and assignments
- Comments and attachments
- All other project-related activities

**Requirements:**
- Validates: Requirements 10.1, 10.2

**Use Cases:**
- View complete project history
- Track project progress and changes
- Audit project modifications
- Monitor team activity on a project
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of activity logs for the project",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to access this project",
					},
					404: {
						description: "Project not found",
					},
				},
			},
		},
	);

// Task-specific activity logs route
export const taskActivityRoutes = new Elysia()
	.decorate("authenticated", false as boolean)
	.decorate("userId", null as string | null)
	.decorate("sessionId", null as string | null)
	.decorate("accessToken", null as string | null)
	// Apply rate limiting to task activity endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "task-activity",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle ActivityLogError
		if (error instanceof ActivityLogError) {
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
		console.error("Unexpected error in task activity routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// GET /tasks/:id/activity - Get activity logs for a specific task
	.get(
		"/tasks/:id/activity",
		async ({ params, query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new ActivityLogError(
					ActivityLogErrorCode.FORBIDDEN,
					"Authentication required",
					401,
				);
			}

			// Parse pagination parameters
			const limit = query.limit ? parseInt(query.limit) : undefined;
			const offset = query.offset ? parseInt(query.offset) : undefined;

			const activities = await activityLogService.getTaskActivity(
				params.id,
				userId,
				limit,
				offset,
			);

			return {
				activities,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Get activity logs for a task",
				description: `
Get all activity logs for a specific task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 403 if user has no access to the project
- Returns 404 if task doesn't exist

**Pagination:**
- \`limit\`: Maximum number of entries to return
- \`offset\`: Number of entries to skip

**Response:**
- Array of activity log entries for the task
- Includes all activities related to the task and its subtasks
- Ordered by creation date (most recent first)

**Activity Types:**
- Task changes (updates, status changes, assignments)
- Subtask changes (creation, updates, deletions)
- Comments and attachments
- Progress updates
- All other task-related activities

**Requirements:**
- Validates: Requirements 10.1, 10.2

**Use Cases:**
- View complete task history
- Track task progress and changes
- Audit task modifications
- Monitor activity on a specific task
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of activity logs for the task",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to access this task",
					},
					404: {
						description: "Task not found",
					},
				},
			},
		},
	);
