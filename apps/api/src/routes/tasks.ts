import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { subtaskService } from "../services/subtask.service";
import {
	TaskLinkError,
	TaskLinkErrorCode,
	taskLinkService,
} from "../services/task-link.service";
import {
	TaskError,
	TaskErrorCode,
	taskService,
} from "../services/task.service";

/**
 * Task routes plugin
 * Provides endpoints for task management, status updates, assignments, progress tracking, and task linking
 */
export const taskRoutes = new Elysia({ prefix: "/tasks" })
	.derive(auth)
	// Apply rate limiting to all task endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "tasks",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle TaskError
		if (error instanceof TaskError) {
			set.status = error.statusCode;
			return {
				error: error.code,
				message: error.message,
			};
		}

		// Handle TaskLinkError
		if (error instanceof TaskLinkError) {
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
		console.error("Unexpected error in task routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// POST /tasks - Create a new task
	.post(
		"/",
		async ({ body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Parse dates if provided
			const createData: any = { ...body };
			if (body.startDate) {
				createData.startDate = new Date(body.startDate);
			}
			if (body.dueDate) {
				createData.dueDate = new Date(body.dueDate);
			}

			const task = await taskService.createTask(createData, userId);

			return {
				task,
			};
		},
		{
			body: t.Object({
				projectId: t.String(),
				title: t.String({ minLength: 1, maxLength: 500 }),
				description: t.Optional(t.String({ maxLength: 5000 })),
				statusId: t.Optional(t.String()),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
						t.Literal("critical"),
					]),
				),
				assignedTo: t.Optional(t.String()),
				startDate: t.Optional(t.String()),
				dueDate: t.Optional(t.String()),
				estimatedHours: t.Optional(t.Number({ minimum: 0 })),
				estimatedPoints: t.Optional(t.Number({ minimum: 0 })),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Create a new task",
				description: `
Create a new task within a project.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be a member of the project
- Returns 403 if user has no access to the project

**Task Creation:**
- Task is created with initial status from project workflow
- If no status is provided, first backlog status is used
- Task follows the project's workflow for status transitions
- Priority defaults to "medium" if not specified

**Date Validation:**
- Start date must be before or equal to due date
- Dates are optional

**Assignment:**
- Assigned user must be a project member
- Assignment is optional

**Archived Projects:**
- Cannot create tasks in archived projects
- Returns 400 if project is archived

**Requirements:**
- Task title must be 1-500 characters
- Description is optional (max 5000 characters)
- Priority must be: low, medium, high, or critical

**Response:**
- Created task object with ID and all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task created successfully",
					},
					400: {
						description: "Validation error or archived project",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to create tasks in this project",
					},
					404: {
						description: "Project not found",
					},
				},
			},
		},
	)
	// GET /tasks - List tasks with filters
	.get(
		"/",
		async ({ query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Parse query parameters
			const filters: any = {
				projectId: query.projectId,
				statusId: query.statusId,
				assignedTo: query.assignedTo,
				priority: query.priority,
				includeDeleted: query.includeDeleted === "true",
				limit: query.limit ? parseInt(query.limit) : undefined,
				offset: query.offset ? parseInt(query.offset) : undefined,
				sortBy: query.sortBy,
				sortDirection: query.sortDirection,
			};

			// Parse date filters
			if (query.startDateFrom) {
				filters.startDateFrom = new Date(query.startDateFrom);
			}
			if (query.startDateTo) {
				filters.startDateTo = new Date(query.startDateTo);
			}
			if (query.dueDateFrom) {
				filters.dueDateFrom = new Date(query.dueDateFrom);
			}
			if (query.dueDateTo) {
				filters.dueDateTo = new Date(query.dueDateTo);
			}

			const tasks = await taskService.listTasks(filters, userId);

			return {
				tasks,
			};
		},
		{
			query: t.Object({
				projectId: t.Optional(t.String()),
				statusId: t.Optional(t.String()),
				assignedTo: t.Optional(t.String()),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
						t.Literal("critical"),
					]),
				),
				startDateFrom: t.Optional(t.String()),
				startDateTo: t.Optional(t.String()),
				dueDateFrom: t.Optional(t.String()),
				dueDateTo: t.Optional(t.String()),
				includeDeleted: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
				sortBy: t.Optional(t.String()),
				sortDirection: t.Optional(
					t.Union([t.Literal("asc"), t.Literal("desc")]),
				),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "List tasks with filters",
				description: `
List tasks with optional filtering.

**Authentication Required:**
- Must include valid access token in Authorization header

**Filtering:**
- \`projectId\`: Filter by project (if omitted, returns tasks from all accessible projects)
- \`statusId\`: Filter by status
- \`assignedTo\`: Filter by assigned user
- \`priority\`: Filter by priority (low, medium, high, critical)
- \`startDateFrom\`: Filter by start date (tasks starting on or after this date)
- \`startDateTo\`: Filter by start date (tasks starting on or before this date)
- \`dueDateFrom\`: Filter by due date (tasks due on or after this date)
- \`dueDateTo\`: Filter by due date (tasks due on or before this date)
- \`includeDeleted\`: Include soft-deleted tasks (default: false)

**Pagination:**
- \`limit\`: Maximum number of tasks to return (default: 50, max: 100)
- \`offset\`: Number of tasks to skip (default: 0)

**Sorting:**
- \`sortBy\`: Field to sort by (e.g., 'title', 'priority', 'createdAt', 'dueDate')
- \`sortDirection\`: Sort direction ('asc' or 'desc', default: 'asc')

**Authorization:**
- Only returns tasks from projects the user has access to
- If projectId is specified, checks access to that project

**Response:**
- Array of task objects matching the filters
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of tasks",
					},
					401: {
						description: "Authentication required",
					},
				},
			},
		},
	)
	// GET /tasks/:id - Get task details
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const task = await taskService.getTask(params.id, userId);

			if (!task) {
				throw new TaskError(
					TaskErrorCode.TASK_NOT_FOUND,
					"Task not found or access denied",
					404,
				);
			}

			return {
				task,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Get task details",
				description: `
Get detailed information about a specific task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Response:**
- Complete task object with all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task details",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// PUT /tasks/:id - Update task details
	.put(
		"/:id",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Parse dates if provided
			const updateData: any = { ...body };
			if (body.startDate) {
				updateData.startDate = new Date(body.startDate);
			}
			if (body.dueDate) {
				updateData.dueDate = new Date(body.dueDate);
			}

			const task = await taskService.updateTask(params.id, updateData, userId);

			return {
				task,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
				description: t.Optional(t.String({ maxLength: 5000 })),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
						t.Literal("critical"),
					]),
				),
				startDate: t.Optional(t.String()),
				dueDate: t.Optional(t.String()),
				estimatedHours: t.Optional(t.Number({ minimum: 0 })),
				estimatedPoints: t.Optional(t.Number({ minimum: 0 })),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Update task details",
				description: `
Update task properties.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Changes are logged in the activity log
- Status cannot be changed via this endpoint (use PATCH /tasks/:id/status)

**Date Validation:**
- Start date must be before or equal to due date
- Validation considers both new and existing dates

**Response:**
- Updated task object with new values
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task updated successfully",
					},
					400: {
						description: "Validation error",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// DELETE /tasks/:id - Delete a task
	.delete(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await taskService.deleteTask(params.id, userId);

			return {
				message: "Task deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Delete a task",
				description: `
Delete a task (soft delete).

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Cascade Deletion:**
- All subtasks are soft deleted
- All comments and attachments are deleted
- All task links are removed
- Activity logs are preserved for audit purposes

**Soft Delete:**
- Task is marked as deleted but not removed from database
- Can be filtered out from list queries
- Preserves data for audit and recovery purposes

**Response:**
- Success message on successful deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task deleted successfully",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// PATCH /tasks/:id/status - Update task status
	.patch(
		"/:id/status",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const task = await taskService.updateTaskStatus(
				params.id,
				body.statusId,
				userId,
			);

			return {
				task,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				statusId: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Update task status",
				description: `
Update the status of a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Status Validation:**
- Status must belong to the project's workflow
- Returns 400 if status is invalid or doesn't belong to workflow

**Activity Logging:**
- Status change is logged in the activity log
- Includes old and new status values

**Response:**
- Updated task object with new status
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task status updated successfully",
					},
					400: {
						description: "Invalid status or status doesn't belong to workflow",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// POST /tasks/:id/assign - Assign task to a user
	.post(
		"/:id/assign",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await taskService.assignTask(params.id, body.assigneeId, userId);

			return {
				message: "Task assigned successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				assigneeId: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Assign task to a user",
				description: `
Assign a task to a user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Assigned user must be a project member
- Returns 404 if task doesn't exist or user has no access
- Returns 400 if assignee is not a project member

**Single Assignment:**
- Each task can be assigned to exactly one user at a time
- Previous assignment is replaced if task is already assigned

**Activity Logging:**
- Assignment change is logged in the activity log

**Response:**
- Success message on successful assignment
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task assigned successfully",
					},
					400: {
						description: "Assignee is not a project member",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// DELETE /tasks/:id/assign - Unassign task
	.delete(
		"/:id/assign",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await taskService.unassignTask(params.id, userId);

			return {
				message: "Task unassigned successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Unassign task",
				description: `
Remove the assignment from a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Activity Logging:**
- Assignment removal is logged in the activity log

**Response:**
- Success message on successful unassignment
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task unassigned successfully",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// PATCH /tasks/:id/progress - Update task progress
	.patch(
		"/:id/progress",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const task = await taskService.updateProgress(
				params.id,
				body.progress,
				userId,
			);

			return {
				task,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				progress: t.Number({ minimum: 0, maximum: 100 }),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Update task progress",
				description: `
Update the progress percentage of a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 404 if task doesn't exist or user has no access

**Progress Validation:**
- Progress must be between 0 and 100 (inclusive)
- Represents completion percentage

**Manual vs Automatic:**
- This endpoint sets progress manually
- Progress can also be calculated automatically from subtasks
- Manual updates override automatic calculation

**Response:**
- Updated task object with new progress value
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task progress updated successfully",
					},
					400: {
						description: "Invalid progress value (must be 0-100)",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Task not found or access denied",
					},
				},
			},
		},
	)
	// POST /tasks/:id/links - Create a task link
	.post(
		"/:id/links",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskLinkError(
					TaskLinkErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await taskLinkService.createLink(
				params.id,
				body.targetTaskId,
				body.linkType,
				userId,
			);

			return {
				message: "Task link created successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				targetTaskId: t.String(),
				linkType: t.Union([
					t.Literal("blocks"),
					t.Literal("blocked_by"),
					t.Literal("depends_on"),
					t.Literal("dependency_of"),
					t.Literal("relates_to"),
					t.Literal("duplicates"),
					t.Literal("duplicated_by"),
				]),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Create a task link",
				description: `
Create a relationship between two tasks.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to both tasks' projects
- Returns 403 if user has no access to either project
- Returns 404 if either task doesn't exist

**Link Types:**
- \`blocks\`: Source task blocks target task
- \`blocked_by\`: Source task is blocked by target task
- \`depends_on\`: Source task depends on target task
- \`dependency_of\`: Source task is a dependency of target task
- \`relates_to\`: Source task relates to target task (non-directional)
- \`duplicates\`: Source task duplicates target task
- \`duplicated_by\`: Source task is duplicated by target task

**Inverse Relationships:**
- Directional links automatically create inverse relationships
- Example: Creating "blocks" also creates "blocked_by" in reverse
- Non-directional links (relates_to) don't create inverses

**Validation:**
- Cannot link a task to itself
- Both tasks must exist and be accessible

**Response:**
- Success message on successful link creation
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task link created successfully",
					},
					400: {
						description: "Invalid link type or cannot link task to itself",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to access one or both tasks",
					},
					404: {
						description: "One or both tasks not found",
					},
				},
			},
		},
	)
	// DELETE /tasks/:id/links/:linkId - Delete a task link
	.delete(
		"/:id/links/:linkId",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskLinkError(
					TaskLinkErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await taskLinkService.deleteLink(params.linkId, userId);

			return {
				message: "Task link deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
				linkId: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "Delete a task link",
				description: `
Remove a relationship between two tasks.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the source task's project
- Returns 403 if user has no access
- Returns 404 if link doesn't exist

**Inverse Relationships:**
- Deleting a directional link also deletes its inverse
- Example: Deleting "blocks" also deletes the corresponding "blocked_by"

**Response:**
- Success message on successful link deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task link deleted successfully",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to delete this link",
					},
					404: {
						description: "Link not found",
					},
				},
			},
		},
	)
	// GET /tasks/:id/links - List task links
	.get(
		"/:id/links",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskLinkError(
					TaskLinkErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const links = await taskLinkService.listLinks(params.id, userId);

			return {
				links,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tasks"],
				summary: "List task links",
				description: `
Get all relationships for a task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task's project
- Returns 403 if user has no access
- Returns 404 if task doesn't exist

**Response:**
- Array of link objects
- Includes links where task is source or target
- Each link includes source task ID, target task ID, and link type
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of task links",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to view this task's links",
					},
					404: {
						description: "Task not found",
					},
				},
			},
		},
	)
	// GET /tasks/:id/subtasks - List subtasks for a task
	.get(
		"/:id/subtasks",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new TaskError(
					TaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const subtasks = await subtaskService.listSubtasks(params.id, userId);

			return {
				subtasks,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tasks", "Subtasks"],
				summary: "List subtasks for a task",
				description: `
Get all subtasks for a specific parent task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns empty array if task doesn't exist or user has no access

**Filtering:**
- Only returns non-deleted subtasks
- Subtasks are ordered by creation date

**Response:**
- Array of subtask objects
- Each subtask includes all metadata (title, description, status, priority, dates, etc.)
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of subtasks",
					},
					401: {
						description: "Authentication required",
					},
				},
			},
		},
	);
