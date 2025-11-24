import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	AttachmentError,
	AttachmentErrorCode,
	attachmentService,
} from "../services/attachment.service";

/**
 * Attachment routes plugin
 * Provides endpoints for file upload, download, and management
 */
export const attachmentRoutes = new Elysia({ prefix: "/attachments" })
	.use(auth())
	// Apply rate limiting to all attachment endpoints
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "attachments",
		}),
	)
	.onError(({ code, error, set }) => {
		// Handle AttachmentError
		if (error instanceof AttachmentError) {
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
		console.error("Unexpected error in attachment routes:", error);
		set.status = 500;
		return {
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
		};
	})
	// POST /attachments - Upload a new attachment
	.post(
		"/",
		async ({ body, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const attachment = await attachmentService.uploadAttachment(
				{
					relatedEntityType: body.relatedEntityType,
					relatedEntityId: body.relatedEntityId,
					file: body.file,
					originalFilename: body.file.name,
					mimeType: body.file.type,
				},
				userId,
			);

			return {
				attachment,
			};
		},
		{
			body: t.Object({
				relatedEntityType: t.Union([t.Literal("task"), t.Literal("subtask")]),
				relatedEntityId: t.String(),
				file: t.File({
					maxSize: 50 * 1024 * 1024, // 50MB
				}),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "Upload a new attachment",
				description: `
Upload a file attachment to a task or subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task or subtask's project
- Returns 403 if user has no access to the project
- Returns 404 if task or subtask doesn't exist

**File Upload:**
- Maximum file size: 50MB
- Supported file types:
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF, Word, Excel, PowerPoint
  - Text: Plain text, CSV, Markdown
  - Archives: ZIP, TAR, GZIP
  - Code: JSON, XML, HTML, CSS, JavaScript
- File is stored in local filesystem with unique filename
- Original filename is preserved in metadata

**Storage:**
- Files are organized by date: uploads/attachments/YYYY/MM/DD/
- Unique UUID-based filename prevents conflicts
- File metadata is stored in database

**Activity Logging:**
- Attachment upload is logged in the activity log

**Requirements:**
- Validates: Requirements 9.1, 9.5

**Response:**
- Created attachment object with ID and all metadata
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Attachment uploaded successfully",
					},
					400: {
						description:
							"Validation error, file too large, or invalid MIME type",
					},
					401: {
						description: "Authentication required",
					},
					403: {
						description: "Not authorized to upload to this task/subtask",
					},
					404: {
						description: "Task or subtask not found",
					},
				},
			},
		},
	)
	// GET /attachments - List attachments for a task or subtask
	.get(
		"/",
		async ({ query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Validate required query parameters
			if (!query.relatedEntityType || !query.relatedEntityId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"relatedEntityType and relatedEntityId are required",
					400,
				);
			}

			const attachments = await attachmentService.listAttachments(
				query.relatedEntityType,
				query.relatedEntityId,
				userId,
			);

			return {
				attachments,
			};
		},
		{
			query: t.Object({
				relatedEntityType: t.Union([t.Literal("task"), t.Literal("subtask")]),
				relatedEntityId: t.String(),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "List attachments for a task or subtask",
				description: `
Get all attachments for a specific task or subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task or subtask's project
- Returns empty array if task/subtask doesn't exist or user has no access

**Query Parameters:**
- \`relatedEntityType\`: Type of entity (task or subtask) - required
- \`relatedEntityId\`: ID of the task or subtask - required

**Response:**
- Array of attachment objects ordered by creation date (newest first)
- Each attachment includes:
  - Metadata (id, filename, size, MIME type, uploader, timestamps)
  - Storage information (path)
  - Original filename

**Requirements:**
- Validates: Requirements 9.4

**Use Cases:**
- Display attachments on task detail pages
- Show file list in UI
- Download attachments
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "List of attachments",
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
	// GET /attachments/:id - Get attachment details
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			const attachment = await attachmentService.getAttachment(
				params.id,
				userId,
			);

			if (!attachment) {
				throw new AttachmentError(
					AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
					"Attachment not found or access denied",
					404,
				);
			}

			return {
				attachment,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "Get attachment details",
				description: `
Get detailed information about a specific attachment.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the attachment's related task or subtask
- Returns 404 if attachment doesn't exist or user has no access

**Response:**
- Complete attachment object with all metadata
- Includes file information (size, MIME type, original filename)
- Includes uploader and timestamps

**Use Cases:**
- Display attachment details
- Verify file information before download
- Show attachment metadata in UI
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Attachment details",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Attachment not found or access denied",
					},
				},
			},
		},
	)
	// GET /attachments/:id/url - Get secure download URL
	.get(
		"/:id/url",
		async ({ params, query, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			// Parse expiration time (default: 1 hour)
			const expiresIn = query.expiresIn ? parseInt(query.expiresIn, 10) : 3600;

			// Validate expiration time (max 24 hours)
			if (expiresIn < 60 || expiresIn > 86400) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Expiration time must be between 60 and 86400 seconds",
					400,
				);
			}

			const url = await attachmentService.getAttachmentUrl(
				params.id,
				userId,
				expiresIn,
			);

			return {
				url,
				expiresIn,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				expiresIn: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "Get secure download URL",
				description: `
Generate a secure, time-limited URL for downloading an attachment.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the attachment's related task or subtask
- Returns 404 if attachment doesn't exist or user has no access

**Query Parameters:**
- \`expiresIn\`: Expiration time in seconds (default: 3600 = 1 hour)
  - Minimum: 60 seconds (1 minute)
  - Maximum: 86400 seconds (24 hours)

**Security:**
- URL includes a cryptographically signed token
- Token is valid only for the specified duration
- Token signature prevents tampering
- URL can only be used to download the specific attachment

**Requirements:**
- Validates: Requirements 9.2, 9.6

**Response:**
- Secure URL with embedded token
- Expiration time in seconds

**Use Cases:**
- Generate download links for attachments
- Share time-limited access to files
- Implement secure file downloads in UI

**Example:**
\`\`\`typescript
// Get download URL
const response = await fetch('/api/attachments/123/url?expiresIn=3600', {
  headers: { 'Authorization': 'Bearer <token>' }
});
const { url } = await response.json();

// Use URL to download file
window.location.href = url;
\`\`\`
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Secure download URL generated",
					},
					400: {
						description: "Invalid expiration time",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Attachment not found or access denied",
					},
				},
			},
		},
	)
	// GET /attachments/:id/download - Download attachment file
	.get(
		"/:id/download",
		async ({ params, query, set }) => {
			// Verify token
			if (!query.token) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Download token required",
					401,
				);
			}

			const attachmentId = await attachmentService.verifyToken(query.token);

			if (!attachmentId || attachmentId !== params.id) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Invalid or expired download token",
					401,
				);
			}

			// Get attachment file
			const { filePath, attachment } =
				await attachmentService.getAttachmentFilePath(params.id);

			// Read file
			const file = Bun.file(filePath);

			if (!(await file.exists())) {
				throw new AttachmentError(
					AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
					"Attachment file not found",
					404,
				);
			}

			// Set response headers
			set.headers["Content-Type"] = attachment.mimeType;
			set.headers[
				"Content-Disposition"
			] = `attachment; filename="${attachment.originalFilename}"`;
			set.headers["Content-Length"] = attachment.fileSize.toString();

			// Return file
			return file;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				token: t.String(),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "Download attachment file",
				description: `
Download an attachment file using a secure token.

**Authentication:**
- Requires a valid download token (obtained from GET /attachments/:id/url)
- No bearer token required (token is in URL)

**Security:**
- Token is validated and must match the attachment ID
- Token must not be expired
- Token can only be used once (single-use)

**Response:**
- File content with appropriate headers
- Content-Type header set to file's MIME type
- Content-Disposition header set to trigger download
- Original filename is preserved

**Requirements:**
- Validates: Requirements 9.2

**Note:** This endpoint is typically called by the browser when user clicks a download link. The token is obtained from the GET /attachments/:id/url endpoint.

**Example Flow:**
1. Client calls GET /attachments/:id/url to get secure URL
2. Client redirects user to the URL (or opens in new tab)
3. This endpoint validates token and returns file
4. Browser downloads the file
        `,
				responses: {
					200: {
						description: "File download",
						content: {
							"application/octet-stream": {
								schema: {
									type: "string",
									format: "binary",
								},
							},
						},
					},
					401: {
						description: "Invalid or expired download token",
					},
					404: {
						description: "Attachment or file not found",
					},
				},
			},
		},
	)
	// DELETE /attachments/:id - Delete an attachment
	.delete(
		"/:id",
		async ({ params, authenticated, userId }) => {
			// Check authentication
			if (!authenticated || !userId) {
				throw new AttachmentError(
					AttachmentErrorCode.UNAUTHORIZED,
					"Authentication required",
					401,
				);
			}

			await attachmentService.deleteAttachment(params.id, userId);

			return {
				message: "Attachment deleted successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Attachments"],
				summary: "Delete an attachment",
				description: `
Delete an attachment and its associated file.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the attachment's related task or subtask
- Returns 404 if attachment doesn't exist or user has no access

**Deletion:**
- File is removed from storage
- Metadata is removed from database
- This action cannot be undone

**Requirements:**
- Validates: Requirements 9.3

**Response:**
- Success message on successful deletion

**Note:** If file deletion fails but database deletion succeeds, the orphaned file will be cleaned up by a background job.
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Attachment deleted successfully",
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "Attachment not found or access denied",
					},
				},
			},
		},
	);
