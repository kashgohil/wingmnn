import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	CommentError,
	CommentErrorCode,
	commentService,
} from "../services/comment.service";

/**
 * Comment routes plugin
 * Provides endpoints for comment management with threading support
 */
export const commentRoutes = new Elysia({ prefix: "/comments" })
	.use(auth())
	// Apply rate limiting to all comment endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "comments",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle CommentError
		if (error instanceof CommentError) {
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
		console.error("Unexpected error in comment routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// POST /comments - Create a new comment
	.post(
		"/",
		async ({ body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const comment = await commentService.createComment(body, userId);

			return {
				comment,
			};
		},
		{
			body: t.Object({
				relatedEntityType: t.Union([t.Literal("task"), t.Literal("subtask")]),
				relatedEntityId: t.String(),
				parentCommentId: t.Optional(t.String()),
				content: t.String({ minLength: 1, maxLength: 10000 }),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Create a new comment",
				description: `
Create a new comment on a task or subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be a member of the project containing the task or subtask
- Returns 403 if user has no access to the project
- Returns 404 if task or subtask doesn't exist

**Comment Creation:**
- Content must be 1-10000 characters
- Supports markdown formatting
- Can be a top-level comment or a reply (if parentCommentId is provided)
- Comment is associated with the authenticated user as author

**Threading:**
- If parentCommentId is provided, creates a reply to that comment
- Parent comment must exist and belong to the same task or subtask
- Supports nested replies (replies to replies)

**Activity Logging:**
- Comment creation is logged in the activity log

**Requirements:**
- Validates: Requirements 8.1, 8.6

**Response:**
- Created comment object with ID and all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Comment created successfully",
					},
					400: {
						description:
							"Validation error, empty content, or invalid parent comment",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to comment on this task/subtask",
					},
					404: {
						description: "Task, subtask, or parent comment not found",
					},
				},
			},
		},
	)
	// GET /comments - List comments for a task or subtask
	.get(
		"/",
		async ({ query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Validate required query parameters
			if (!query.relatedEntityType || !query.relatedEntityId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"relatedEntityType and relatedEntityId are required",
					400,
				);
			}

			const comments = await commentService.listComments(
				query.relatedEntityType,
				query.relatedEntityId,
				userId,
			);

			return {
				comments,
			};
		},
		{
			query: t.Object({
				relatedEntityType: t.Union([t.Literal("task"), t.Literal("subtask")]),
				relatedEntityId: t.String(),
			}),
			detail: {
				tags: ["Comments"],
				summary: "List comments for a task or subtask",
				description: `
Get all comments for a specific task or subtask with nested structure.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task or subtask's project
- Returns empty array if task/subtask doesn't exist or user has no access

**Query Parameters:**
- \`relatedEntityType\`: Type of entity (task or subtask) - required
- \`relatedEntityId\`: ID of the task or subtask - required

**Response Structure:**
- Returns top-level comments with nested replies
- Comments are ordered by creation date (oldest first)
- Each comment includes:
  - Comment metadata (id, content, author, timestamps)
  - Nested replies array (if any)
  - Replies are also ordered by creation date

**Threading:**
- Top-level comments have parentCommentId = null
- Replies have parentCommentId set to their parent
- Supports unlimited nesting depth

**Requirements:**
- Validates: Requirements 8.4

**Use Cases:**
- Display comment threads on task detail pages
- Show discussion history
- Implement comment sections in UI
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of comments with nested replies",
					},
					400: {
						description: "Missing required query parameters",
					},
					401: {
						description: "Authentication required",
					},
				},
			},
		},
	)
	// GET /comments/:id - Get a specific comment
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const comment = await commentService.getCommentThread(params.id, userId);

			if (!comment) {
				throw new CommentError(
					CommentErrorCode.COMMENT_NOT_FOUND,
					"Comment not found or access denied",
					404,
				);
			}

			return {
				comment,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Get a specific comment with its thread",
				description: `
Get detailed information about a specific comment including all its replies.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the comment's related task or subtask
- Returns 404 if comment doesn't exist or user has no access

**Response:**
- Complete comment object with all metadata
- Includes nested replies (entire thread)
- Replies are ordered by creation date

**Use Cases:**
- Display a specific comment thread
- Link to individual comments
- Show comment context
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Comment with nested replies",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Comment not found or access denied",
					},
				},
			},
		},
	)
	// PUT /comments/:id - Update a comment
	.put(
		"/:id",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const comment = await commentService.updateComment(
				params.id,
				body.content,
				userId,
			);

			return {
				comment,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1, maxLength: 10000 }),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Update a comment",
				description: `
Update the content of a comment.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the comment's related task or subtask
- Only the comment author can update the comment
- Returns 404 if comment doesn't exist or user has no access
- Returns 403 if user is not the comment author

**Update Behavior:**
- Content is replaced with new value
- Edit timestamp (editedAt) is set to current time
- Original creation timestamp remains unchanged
- Content must be 1-10000 characters

**Requirements:**
- Validates: Requirements 8.2

**Response:**
- Updated comment object with new content and editedAt timestamp
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Comment updated successfully",
					},
					400: {
						description: "Validation error or empty content",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Can only update your own comments",
					},
					404: {
						description: "Comment not found or access denied",
					},
				},
			},
		},
	)
	// DELETE /comments/:id - Delete a comment
	.delete(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await commentService.deleteComment(params.id, userId);

			return {
				message: "Comment deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Delete a comment",
				description: `
Delete a comment and all its replies.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the comment's related task or subtask
- Only the comment author can delete the comment
- Returns 404 if comment doesn't exist or user has no access
- Returns 403 if user is not the comment author

**Cascade Deletion:**
- All replies to this comment are also deleted
- Deletion cascades to nested replies (entire thread)
- This action cannot be undone

**Requirements:**
- Validates: Requirements 8.3

**Response:**
- Success message on successful deletion
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Comment deleted successfully",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Can only delete your own comments",
					},
					404: {
						description: "Comment not found or access denied",
					},
				},
			},
		},
	)
	// POST /comments/:id/replies - Create a reply to a comment
	.post(
		"/:id/replies",
		async ({ params, body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const reply = await commentService.replyToComment(
				params.id,
				body.content,
				userId,
			);

			return {
				comment: reply,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1, maxLength: 10000 }),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Reply to a comment",
				description: `
Create a reply to an existing comment.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must be a member of the project containing the parent comment
- Returns 403 if user has no access to the project
- Returns 404 if parent comment doesn't exist

**Reply Creation:**
- Content must be 1-10000 characters
- Supports markdown formatting
- Reply is automatically associated with the same task or subtask as parent
- Reply is associated with the authenticated user as author

**Threading:**
- Creates a nested reply under the parent comment
- Supports unlimited nesting depth (replies to replies)
- Parent comment ID is automatically set

**Requirements:**
- Validates: Requirements 8.1

**Response:**
- Created reply comment object with ID and all metadata

**Note:** This is a convenience endpoint. You can also use POST /comments with parentCommentId.
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Reply created successfully",
					},
					400: {
						description: "Validation error or empty content",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to reply to this comment",
					},
					404: {
						description: "Parent comment not found",
					},
				},
			},
		},
	)
	// GET /comments/:id/replies - Get all replies to a comment
	.get(
		"/:id/replies",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new CommentError(
					CommentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const comment = await commentService.getCommentThread(params.id, userId);

			if (!comment) {
				throw new CommentError(
					CommentErrorCode.COMMENT_NOT_FOUND,
					"Comment not found or access denied",
					404,
				);
			}

			return {
				replies: comment.replies || [],
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Comments"],
				summary: "Get all replies to a comment",
				description: `
Get all direct and nested replies to a specific comment.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the comment's related task or subtask
- Returns 404 if comment doesn't exist or user has no access

**Response:**
- Array of reply comments with nested structure
- Replies are ordered by creation date (oldest first)
- Each reply includes its own nested replies (if any)

**Threading:**
- Returns the complete reply tree
- Supports unlimited nesting depth
- Empty array if comment has no replies

**Use Cases:**
- Display reply threads
- Load replies on demand
- Implement "show replies" functionality
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of replies with nested structure",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Comment not found or access denied",
					},
				},
			},
		},
	);
