import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { errorHandler } from "./middleware/error-handler";
import {
	activityLogRoutes,
	projectActivityRoutes,
	taskActivityRoutes,
} from "./routes/activity-logs";
import { attachmentRoutes } from "./routes/attachments";
import { authRoutes } from "./routes/auth";
import { commentRoutes } from "./routes/comments";
import { notificationRoutes } from "./routes/notifications";
import { projectRoutes } from "./routes/projects";
import { subtaskRoutes } from "./routes/subtasks";
import { tagRoutes, taskTagRoutes } from "./routes/tags";
import { taskRoutes } from "./routes/tasks";
import { timeEntryRoutes } from "./routes/time-entries";
import { workflowRoutes } from "./routes/workflows";
import { cleanupService } from "./services/cleanup.service";
import { initializeOAuthProviders } from "./services/oauth.service";

// Global error handlers for uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (error: Error) => {
	console.error("\n[FATAL] Uncaught Exception:", {
		name: error.name,
		message: error.message,
		stack: error.stack,
		timestamp: new Date().toISOString(),
	});
	console.error("[FATAL] Stack Trace:", error.stack);
	// In production, you might want to gracefully shutdown
	// For now, we'll log and continue
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
	console.error("\n[FATAL] Unhandled Promise Rejection:", {
		reason:
			reason instanceof Error
				? {
						name: reason.name,
						message: reason.message,
						stack: reason.stack,
				  }
				: reason,
		timestamp: new Date().toISOString(),
	});
	if (reason instanceof Error && reason.stack) {
		console.error("[FATAL] Stack Trace:", reason.stack);
	}
	// In production, you might want to gracefully shutdown
	// For now, we'll log and continue
});

// Initialize OAuth providers (async)
await initializeOAuthProviders({
	google: {
		clientId: config.GOOGLE_CLIENT_ID,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
	},
});

// Run cleanup job for expired sessions and old used refresh tokens
// Run daily (every 24 hours)
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Run cleanup on startup (after a short delay to ensure DB is ready)
setTimeout(async () => {
	try {
		await cleanupService.runCleanup();
	} catch (error) {
		console.error("[Cleanup] Error running initial cleanup:", error);
	}
}, 5000); // 5 second delay

// Schedule cleanup to run daily
setInterval(async () => {
	try {
		await cleanupService.runCleanup();
	} catch (error) {
		console.error("[Cleanup] Error running scheduled cleanup:", error);
	}
}, CLEANUP_INTERVAL_MS);

const apiRoutes = new Elysia({ prefix: "/api" })
	.use(authRoutes)
	.use(workflowRoutes)
	.use(projectRoutes)
	.use(taskRoutes)
	.use(subtaskRoutes)
	.use(timeEntryRoutes)
	.use(commentRoutes)
	.use(attachmentRoutes)
	.use(activityLogRoutes)
	.use(projectActivityRoutes)
	.use(taskActivityRoutes)
	.use(notificationRoutes)
	.use(tagRoutes)
	.use(taskTagRoutes)
	.get("/", () => "Hello Elysia");

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Wingmnn API",
					version: "1.0.0",
					description: `

# Project Management API

A comprehensive project management system with authentication, workflows, task tracking, time management, and team collaboration features.

## Core Features

### 🔐 Authentication & Authorization
- **Email/Password Authentication**: Secure user registration and login
- **OAuth SSO**: Google authentication (extensible to other providers)
- **Session Management**: Multi-device support with 30-day sessions
- **Token Security**: JWT access tokens with automatic refresh token rotation

### 📋 Workflow Management
- **Custom Workflows**: Define project-specific workflows with custom statuses
- **Status Transitions**: Configure allowed status transitions and validation rules
- **Workflow Templates**: Reusable workflow definitions across projects

### 🎯 Project Management
- **Project Creation**: Create and configure projects with custom workflows
- **Team Management**: Add/remove team members and manage project access
- **Project Status**: Track project progress and status updates
- **Activity Tracking**: Complete audit trail of all project changes

### ✅ Task Management
- **Task Organization**: Create, assign, and track tasks within projects
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Task Linking**: Create dependencies between tasks (blocks/blocked by)
- **Progress Tracking**: Monitor task completion and progress
- **Priority & Estimation**: Set priorities and estimate effort
- **Custom Fields**: Tags for categorization and filtering

### ⏱️ Time Tracking
- **Time Entries**: Log time spent on tasks and subtasks
- **Time Summaries**: Calculate total time by task, project, or user
- **Billable Hours**: Track billable vs non-billable time
- **Time Reports**: Generate time reports for analysis

### 💬 Collaboration
- **Comments**: Thread-based discussions on tasks and subtasks
- **Mentions**: Notify team members with @mentions
- **Notifications**: Real-time notifications for assignments and updates
- **File Attachments**: Upload and manage files on tasks

### 📊 Activity & Audit
- **Activity Logs**: Complete history of all changes and actions
- **Filtering**: Filter activities by entity, action type, or user
- **Audit Trail**: Track who did what and when for compliance

## Authentication

All endpoints (except auth registration/login) require authentication using JWT tokens.

### Getting Started

1. **Register or Login**: Obtain access token via \`/auth/register\` or \`/auth/login\`
2. **Include Token**: Send access token in \`Authorization: Bearer <token>\` header
3. **Auto-Refresh**: Tokens are automatically refreshed when near expiration

### Token Types

- **Access Token**: JWT valid for 15 minutes, sent in Authorization header
- **Refresh Token**: HTTP-only cookie valid for 30 days, automatically sent

### Example Request

\`\`\`typescript
const response = await fetch('/api/projects', {
  method: 'GET',
  credentials: 'include', // Important: Send cookies
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  }
});

// Check for refreshed token
const newToken = response.headers.get('X-Access-Token');
if (newToken) {
  // Update stored access token
  accessToken = newToken;
}
\`\`\`

## API Organization

The API is organized into the following modules:

- **/auth** - Authentication, registration, and session management
- **/workflows** - Workflow and status management
- **/projects** - Project CRUD and team management
- **/tasks** - Task management and linking
- **/subtasks** - Subtask management
- **/time-entries** - Time tracking and summaries
- **/comments** - Comments and discussions
- **/attachments** - File uploads and downloads
- **/activity-logs** - Activity history and audit trails
- **/notifications** - User notifications
- **/tags** - Tag management and associations

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
\`\`\`

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate or constraint violation)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## Security

- **HTTPS Only**: All endpoints must use HTTPS in production
- **CSRF Protection**: State parameter validation for OAuth flows
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: HTTP-only cookies for refresh tokens
          `,
				},
				tags: [
					{
						name: "Authentication",
						description: "Email/password authentication endpoints",
					},
					{
						name: "OAuth",
						description: "OAuth SSO authentication endpoints",
					},
					{
						name: "Session Management",
						description: "Session management and revocation endpoints",
					},
					{
						name: "Workflows",
						description: "Workflow and status management endpoints",
					},
					{
						name: "Projects",
						description:
							"Project management, status updates, and member management endpoints",
					},
					{
						name: "Tasks",
						description:
							"Task management, status updates, assignments, progress tracking, and task linking endpoints",
					},
					{
						name: "Subtasks",
						description:
							"Subtask management, status updates, and assignment endpoints",
					},
					{
						name: "Time Tracking",
						description:
							"Time entry management and time summary calculation endpoints",
					},
					{
						name: "Comments",
						description:
							"Comment management with threading support for tasks and subtasks",
					},
					{
						name: "Attachments",
						description:
							"File attachment management for tasks and subtasks with secure download URLs",
					},
					{
						name: "Activity Logs",
						description:
							"Activity log viewing and filtering for audit trails and change history",
					},
					{
						name: "Notifications",
						description:
							"Notification management for assignments, status changes, and mentions",
					},
					{
						name: "Tags",
						description:
							"Tag management and task-tag associations for categorizing and filtering work items",
					},
				],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
							description:
								"JWT access token obtained from login or registration",
						},
						cookieAuth: {
							type: "apiKey",
							in: "cookie",
							name: "refresh_token",
							description:
								"HTTP-only refresh token cookie (automatically sent by browser)",
						},
					},
				},
			},
		}),
	)
	.use(
		cors({
			origin: isProduction
				? process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || []
				: true, // Allow all origins in development
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowedHeaders: [
				"Content-Type",
				"Authorization",
				"X-Requested-With",
				"X-CSRF-Token", // CSRF protection
				"X-Forwarded-For", // IP forwarding (proxy support)
				"X-Real-IP", // Alternative IP header
				"User-Agent", // Client identification
			],
			exposeHeaders: [
				"X-Access-Token", // New access token after refresh
				"X-RateLimit-Limit", // Rate limit maximum
				"X-RateLimit-Remaining", // Rate limit remaining
				"X-RateLimit-Reset", // Rate limit reset time
				"Retry-After", // Retry after rate limit
			],
			maxAge: 86400, // 24 hours
		}),
	)
	.use(
		jwt({
			name: "jwt",
			secret: config.JWT_SECRET,
			exp: config.JWT_EXPIRATION,
		}),
	)
	.use(cookie())
	.use(csrf())
	.use(auth())
	.use(errorHandler())
	.use(apiRoutes)
	.listen(config.PORT);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export the app type for use in frontend (via @wingmnn/types package)
export type App = typeof app;
