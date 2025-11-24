import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	SubtaskError,
	SubtaskErrorCode,
	subtaskService,
} from "../services/subtask.service";

/**
 * Subtask routes plugin
 * Provides endpoints for subtask management, status updates, and assignments
 */
export const subtaskRoutes = new Elysia({ prefix: "/subtasks" })
	.derive(auth)
	// Apply rate limiting to all subtask endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "subtasks",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle SubtaskError
		if (error instanceof SubtaskError) {
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
		console.error("Unexpected error in subtask routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// POST /subtasks - Create a new subtask
	.post(
		"/",
		async ({ body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
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

			const subtask = await subtaskService.createSubtask(createData, userId);

			return {
				subtask,
			};
		},
		{
			body: t.Object({
				taskId: t.String(),
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
			}),
			detail: {
				tags: ["Subtasks"],
				summary: "Create a new subtask",
				description: `
Create a new subtask under a parent task.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be a member of the parent task's project
- Returns 403 if user has no access to the project

**Subtask Creation:**
- Subtask is created with initial status from subtask workflow
- If no status is provided, first backlog status from subtask workflow is used
- Subtasks follow a separate subtask workflow (not the task workflow)
- Priority defaults to "medium" if not specified

**Date Validation:**
- Start date must be before or equal to due date
- Dates are optional

**Assignment:**
- Assigned user must be a project member
- Assignment is optional

**Requirements:**
- Subtask title must be 1-500 characters
- Description is optional (max 5000 characters)
- Priority must be: low, medium, high, or critical

**Response:**
- Created subtask object with ID and all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask created successfully",
					},
					400: {
						description: "Validation error",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to create subtasks in this project",
					},
					404: {
						description: "Parent task not found",
					},
				},
			},
		},
	)
	// GET /subtasks/:id - Get subtask details
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const subtask = await subtaskService.getSubtask(params.id, userId);

			if (!subtask) {
				throw new SubtaskError(
					SubtaskErrorCode.SUBTASK_NOT_FOUND,
					"Subtask not found or access denied",
					404,
				);
			}

			return {
				subtask,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Subtasks"],
				summary: "Get subtask details",
				description: `
Get detailed information about a specific subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns 404 if subtask doesn't exist or user has no access

**Response:**
- Complete subtask object with all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask details",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	)
	// PUT /subtasks/:id - Update subtask details
	.put(
		"/:id",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
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

			const subtask = await subtaskService.updateSubtask(
				params.id,
				updateData,
				userId,
			);

			return {
				subtask,
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
			}),
			detail: {
				tags: ["Subtasks"],
				summary: "Update subtask details",
				description: `
Update subtask properties.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns 404 if subtask doesn't exist or user has no access

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Changes are logged in the activity log
- Status cannot be changed via this endpoint (use PATCH /subtasks/:id/status)

**Date Validation:**
- Start date must be before or equal to due date
- Validation considers both new and existing dates

**Response:**
- Updated subtask object with new values
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask updated successfully",
					},
					400: {
						description: "Validation error",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	)
	// DELETE /subtasks/:id - Delete a subtask
	.delete(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await subtaskService.deleteSubtask(params.id, userId);

			return {
				message: "Subtask deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Subtasks"],
				summary: "Delete a subtask",
				description: `
Delete a subtask (soft delete).

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns 404 if subtask doesn't exist or user has no access

**Cascade Deletion:**
- All comments and attachments are deleted
- Activity logs are preserved for audit purposes

**Soft Delete:**
- Subtask is marked as deleted but not removed from database
- Can be filtered out from list queries
- Preserves data for audit and recovery purposes

**Parent Task Progress:**
- Parent task progress is automatically recalculated after deletion

**Response:**
- Success message on successful deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask deleted successfully",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	)
	// PATCH /subtasks/:id/status - Update subtask status
	.patch(
		"/:id/status",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const subtask = await subtaskService.updateSubtaskStatus(
				params.id,
				body.statusId,
				userId,
			);

			return {
				subtask,
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
				tags: ["Subtasks"],
				summary: "Update subtask status",
				description: `
Update the status of a subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns 404 if subtask doesn't exist or user has no access

**Status Validation:**
- Status must belong to a subtask workflow (not a task workflow)
- Returns 400 if status is invalid or doesn't belong to subtask workflow

**Activity Logging:**
- Status change is logged in the activity log
- Includes old and new status values

**Response:**
- Updated subtask object with new status
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask status updated successfully",
					},
					400: {
						description:
							"Invalid status or status doesn't belong to subtask workflow",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	)
	// POST /subtasks/:id/assign - Assign subtask to a user
	.post(
		"/:id/assign",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await subtaskService.assignSubtask(params.id, body.assigneeId, userId);

			return {
				message: "Subtask assigned successfully",
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
				tags: ["Subtasks"],
				summary: "Assign subtask to a user",
				description: `
Assign a subtask to a user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Assigned user must be a project member
- Returns 404 if subtask doesn't exist or user has no access
- Returns 400 if assignee is not a project member

**Single Assignment:**
- Each subtask can be assigned to exactly one user at a time
- Previous assignment is replaced if subtask is already assigned

**Activity Logging:**
- Assignment change is logged in the activity log

**Response:**
- Success message on successful assignment
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask assigned successfully",
					},
					400: {
						description: "Assignee is not a project member",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	)
	// DELETE /subtasks/:id/assign - Unassign subtask
	.delete(
		"/:id/assign",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new SubtaskError(
					SubtaskErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await subtaskService.unassignSubtask(params.id, userId);

			return {
				message: "Subtask unassigned successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Subtasks"],
				summary: "Unassign subtask",
				description: `
Remove the assignment from a subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the parent task's project
- Returns 404 if subtask doesn't exist or user has no access

**Activity Logging:**
- Assignment removal is logged in the activity log

**Response:**
- Success message on successful unassignment
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Subtask unassigned successfully",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Subtask not found or access denied",
					},
				},
			},
		},
	);
