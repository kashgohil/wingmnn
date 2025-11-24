import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	WorkflowError,
	WorkflowErrorCode,
	workflowService,
} from "../services/workflow.service";

/**
 * Workflow routes plugin
 * Provides endpoints for workflow and status management
 */
export const workflowRoutes = new Elysia({ prefix: "/workflows" })
	.derive(auth)
	// Apply rate limiting to all workflow endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "workflows",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle WorkflowError
		if (error instanceof WorkflowError) {
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
		console.error("Unexpected error in workflow routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// POST /workflows - Create a new workflow
	.post(
		"/",
		async ({ body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const workflow = await workflowService.createWorkflow(body, userId);

			return {
				workflow,
			};
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1, maxLength: 100 }),
				description: t.Optional(t.String({ maxLength: 1000 })),
				workflowType: t.Union([t.Literal("task"), t.Literal("subtask")]),
				isTemplate: t.Optional(t.Boolean()),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Create a new workflow",
				description: `
Create a new custom workflow for tasks or subtasks.

**Authentication Required:**
- Must include valid access token in Authorization header

**Workflow Types:**
- \`task\`: Workflow for tasks
- \`subtask\`: Workflow for subtasks (separate from task workflows)

**Template Workflows:**
- Set \`isTemplate: true\` to make the workflow available to all users
- Only administrators should create template workflows

**Requirements:**
- Workflow name must be 1-100 characters
- Description is optional (max 1000 characters)
- After creation, add statuses using the status endpoints
- Workflows must have at least one status in 'backlog' and 'closed' phases before use

**Response:**
- Created workflow object with ID and metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Workflow created successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										workflow: {
											type: "object",
											properties: {
												id: { type: "string", example: "wf_123" },
												name: { type: "string", example: "My Custom Workflow" },
												description: {
													type: "string",
													example: "Custom workflow for feature development",
												},
												workflowType: {
													type: "string",
													enum: ["task", "subtask"],
													example: "task",
												},
												createdBy: { type: "string", example: "user_123" },
												isTemplate: { type: "boolean", example: false },
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
				},
			},
		},
	)
	// GET /workflows - List workflows
	.get(
		"/",
		async ({ query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const { type, limit, offset, sortBy, sortDirection } = query;
			const workflows = await workflowService.listWorkflows(userId, type, {
				limit: limit ? parseInt(limit) : undefined,
				offset: offset ? parseInt(offset) : undefined,
				sortBy,
				sortDirection,
			});

			return {
				workflows,
			};
		},
		{
			query: t.Object({
				type: t.Optional(t.Union([t.Literal("task"), t.Literal("subtask")])),
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
				sortBy: t.Optional(t.String()),
				sortDirection: t.Optional(
					t.Union([t.Literal("asc"), t.Literal("desc")]),
				),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "List workflows",
				description: `
List all workflows accessible to the authenticated user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Returned Workflows:**
- Predefined template workflows (isTemplate: true)
- User's custom workflows (created by the user)
- Shared custom workflows from other users

**Filtering:**
- Use \`type\` query parameter to filter by workflow type (task or subtask)
- Omit \`type\` to get all workflows

**Pagination:**
- \`limit\`: Maximum number of workflows to return (default: 50, max: 100)
- \`offset\`: Number of workflows to skip (default: 0)

**Sorting:**
- \`sortBy\`: Field to sort by (e.g., 'name', 'createdAt', 'workflowType')
- \`sortDirection\`: Sort direction ('asc' or 'desc', default: 'asc')

**Response:**
- Array of workflow objects
- Each workflow includes basic metadata (statuses not included in list view)
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of workflows",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										workflows: {
											type: "array",
											items: {
												type: "object",
												properties: {
													id: { type: "string" },
													name: { type: "string" },
													description: { type: "string" },
													workflowType: {
														type: "string",
														enum: ["task", "subtask"],
													},
													createdBy: { type: "string" },
													isTemplate: { type: "boolean" },
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
		},
	)
	// GET /workflows/:id - Get workflow details
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const workflow = await workflowService.getWorkflow(params.id);

			if (!workflow) {
				throw new WorkflowError(
					WorkflowErrorCode.WORKFLOW_NOT_FOUND,
					"Workflow not found",
					404,
				);
			}

			return {
				workflow,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Get workflow details",
				description: `
Get detailed information about a specific workflow, including all statuses.

**Authentication Required:**
- Must include valid access token in Authorization header

**Response:**
- Complete workflow object with all statuses
- Statuses are ordered by position
- Each status includes phase, color, and position information
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Workflow details",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										workflow: {
											type: "object",
											properties: {
												id: { type: "string" },
												name: { type: "string" },
												description: { type: "string" },
												workflowType: {
													type: "string",
													enum: ["task", "subtask"],
												},
												createdBy: { type: "string" },
												isTemplate: { type: "boolean" },
												createdAt: { type: "string", format: "date-time" },
												updatedAt: { type: "string", format: "date-time" },
												statuses: {
													type: "array",
													items: {
														type: "object",
														properties: {
															id: { type: "string" },
															workflowId: { type: "string" },
															name: { type: "string" },
															description: { type: "string" },
															phase: {
																type: "string",
																enum: [
																	"backlog",
																	"planning",
																	"in_progress",
																	"feedback",
																	"closed",
																],
															},
															colorCode: { type: "string" },
															position: { type: "number" },
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
							},
						},
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Workflow not found",
					},
				},
			},
		},
	)
	// DELETE /workflows/:id - Delete a workflow
	.delete(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await workflowService.deleteWorkflow(params.id, userId);

			return {
				message: "Workflow deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Delete a workflow",
				description: `
Delete a custom workflow.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the workflow creator can delete their custom workflows
- Template workflows cannot be deleted by regular users

**Restrictions:**
- Cannot delete workflows that are in use by any project
- All projects must be updated to use a different workflow first

**Response:**
- Success message on successful deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Workflow deleted successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
											example: "Workflow deleted successfully",
										},
									},
								},
							},
						},
					},
					400: {
						description: "Workflow is in use by projects",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to delete this workflow",
					},
					404: {
						description: "Workflow not found",
					},
				},
			},
		},
	)
	// POST /workflows/:id/statuses - Add a status to a workflow
	.post(
		"/:id/statuses",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const status = await workflowService.addStatus(params.id, body, userId);

			return {
				status,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				name: t.String({ minLength: 1, maxLength: 100 }),
				description: t.Optional(t.String({ maxLength: 500 })),
				phase: t.Union([
					t.Literal("backlog"),
					t.Literal("planning"),
					t.Literal("in_progress"),
					t.Literal("feedback"),
					t.Literal("closed"),
				]),
				colorCode: t.Optional(t.String({ pattern: "^#[0-9A-Fa-f]{6}$" })),
				position: t.Optional(t.Number({ minimum: 0 })),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Add a status to a workflow",
				description: `
Add a new status to an existing workflow.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the workflow creator can add statuses to their custom workflows
- Template workflows can only be modified by administrators

**Phases:**
- \`backlog\`: Initial state for new items
- \`planning\`: Planning and preparation phase
- \`in_progress\`: Active work phase
- \`feedback\`: Review and feedback phase
- \`closed\`: Completed or closed state

**Requirements:**
- Workflows must have at least one status in 'backlog' and 'closed' phases
- Status name must be 1-100 characters
- Color code must be a valid hex color (e.g., #FF5733)
- Position is optional (defaults to end of list)

**Response:**
- Created status object with ID and metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Status added successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										status: {
											type: "object",
											properties: {
												id: { type: "string", example: "status_123" },
												workflowId: { type: "string", example: "wf_123" },
												name: { type: "string", example: "In Progress" },
												description: {
													type: "string",
													example: "Work is actively being done",
												},
												phase: {
													type: "string",
													enum: [
														"backlog",
														"planning",
														"in_progress",
														"feedback",
														"closed",
													],
													example: "in_progress",
												},
												colorCode: { type: "string", example: "#3B82F6" },
												position: { type: "number", example: 2 },
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
						description: "Not authorized to modify this workflow",
					},
					404: {
						description: "Workflow not found",
					},
				},
			},
		},
	)
	// PUT /workflows/:id/statuses/:statusId - Update a status
	.put(
		"/:id/statuses/:statusId",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const status = await workflowService.updateStatus(
				params.statusId,
				body,
				userId,
			);

			return {
				status,
			};
		},
		{
			params: t.Object({
				id: t.String(),
				statusId: t.String(),
			}),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
				description: t.Optional(t.String({ maxLength: 500 })),
				phase: t.Optional(
					t.Union([
						t.Literal("backlog"),
						t.Literal("planning"),
						t.Literal("in_progress"),
						t.Literal("feedback"),
						t.Literal("closed"),
					]),
				),
				colorCode: t.Optional(t.String({ pattern: "^#[0-9A-Fa-f]{6}$" })),
				position: t.Optional(t.Number({ minimum: 0 })),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Update a status",
				description: `
Update an existing status in a workflow.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the workflow creator can update statuses in their custom workflows
- Template workflows can only be modified by administrators

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Changes propagate to all projects using this workflow
- Tasks using this status will reflect the updated properties

**Caution:**
- Changing status properties affects all projects using this workflow
- Consider the impact on existing tasks before making changes
- Use position updates carefully to maintain logical workflow order

**Response:**
- Updated status object with new values
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Status updated successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										status: {
											type: "object",
											properties: {
												id: { type: "string" },
												workflowId: { type: "string" },
												name: { type: "string" },
												description: { type: "string" },
												phase: {
													type: "string",
													enum: [
														"backlog",
														"planning",
														"in_progress",
														"feedback",
														"closed",
													],
												},
												colorCode: { type: "string" },
												position: { type: "number" },
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
						description: "Not authorized to modify this workflow",
					},
					404: {
						description: "Status or workflow not found",
					},
				},
			},
		},
	)
	// DELETE /workflows/:id/statuses/:statusId - Delete a status
	.delete(
		"/:id/statuses/:statusId",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await workflowService.deleteStatus(params.statusId, userId);

			return {
				message: "Status deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
				statusId: t.String(),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Delete a status",
				description: `
Delete a status from a workflow.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the workflow creator can delete statuses from their custom workflows
- Template workflows can only be modified by administrators

**Restrictions:**
- Cannot delete statuses that are in use by any task or subtask
- All tasks must be moved to a different status first
- Workflows must maintain at least one status in 'backlog' and 'closed' phases

**Response:**
- Success message on successful deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Status deleted successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
											example: "Status deleted successfully",
										},
									},
								},
							},
						},
					},
					400: {
						description: "Status is in use by tasks or subtasks",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to modify this workflow",
					},
					404: {
						description: "Status or workflow not found",
					},
				},
			},
		},
	)
	// PATCH /workflows/:id/statuses/reorder - Reorder statuses
	.patch(
		"/:id/statuses/reorder",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new WorkflowError(
					WorkflowErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await workflowService.reorderStatuses(params.id, body.statusIds, userId);

			return {
				message: "Statuses reordered successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				statusIds: t.Array(t.String(), { minItems: 1 }),
			}),
			detail: {
				tags: ["Workflows"],
				summary: "Reorder statuses in a workflow",
				description: `
Reorder statuses within a workflow by providing the desired order.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- Only the workflow creator can reorder statuses in their custom workflows
- Template workflows can only be modified by administrators

**Request Body:**
- \`statusIds\`: Array of status IDs in the desired order
- All status IDs must belong to the specified workflow
- Array must include all statuses (cannot be partial)

**Behavior:**
- Status positions are updated to match the array order
- First status in array gets position 0, second gets position 1, etc.
- Changes are reflected immediately in the workflow

**Use Cases:**
- Reorganize workflow to match team processes
- Group statuses by phase for better visualization
- Adjust order after adding or removing statuses

**Response:**
- Success message on successful reordering
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Statuses reordered successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
											example: "Statuses reordered successfully",
										},
									},
								},
							},
						},
					},
					400: {
						description: "Invalid status IDs or validation error",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to modify this workflow",
					},
					404: {
						description: "Workflow not found",
					},
				},
			},
		},
	);
