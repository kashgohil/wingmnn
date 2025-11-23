import { Elysia, t } from "elysia";
import {
  NotificationError,
  NotificationErrorCode,
  notificationService,
} from "../services/notification.service";

/**
 * Notification routes plugin
 * Provides endpoints for notification management
 */
export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .decorate("authenticated", false as boolean)
  .decorate("userId", null as string | null)
  .decorate("sessionId", null as string | null)
  .decorate("accessToken", null as string | null)
  .onError(({ code, error, set }) => {
    // Handle NotificationError
    if (error instanceof NotificationError) {
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
    console.error("Unexpected error in notification routes:", error);
    set.status = 500;
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  })
  // GET /notifications - List notifications for the authenticated user
  .get(
    "/",
    async ({ query, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new NotificationError(
          NotificationErrorCode.FORBIDDEN,
          "Authentication required",
          401
        );
      }

      const unreadOnly = query.unreadOnly === "true";

      const notifications = await notificationService.listNotifications(
        userId,
        unreadOnly
      );

      return {
        notifications,
      };
    },
    {
      query: t.Object({
        unreadOnly: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Notifications"],
        summary: "List notifications",
        description: `
Get all notifications for the authenticated user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Query Parameters:**
- \`unreadOnly\`: If set to "true", returns only unread notifications (optional)

**Notification Types:**
- \`assignment\`: User was assigned to a task or subtask
- \`status_change\`: Status of an assigned task or subtask changed
- \`mention\`: User was mentioned in a comment

**Ordering:**
- Notifications are ordered by creation date (most recent first)

**Response:**
- Array of notification objects with all metadata
- Each notification includes:
  - Notification ID and type
  - Title and message
  - Related entity information (task or subtask)
  - Read status and timestamp
  - Creation timestamp

**Requirements:**
- Validates: Requirements 13.4

**Use Cases:**
- Display notification list in UI
- Show unread notification count
- Implement notification center
- Keep users informed of relevant changes
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of notifications",
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    }
  )
  // PATCH /notifications/:id/read - Mark a notification as read
  .patch(
    "/:id/read",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new NotificationError(
          NotificationErrorCode.FORBIDDEN,
          "Authentication required",
          401
        );
      }

      await notificationService.markAsRead(params.id, userId);

      return {
        message: "Notification marked as read",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        description: `
Mark a specific notification as read.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User can only mark their own notifications as read
- Returns 404 if notification doesn't exist
- Returns 403 if notification belongs to another user

**Update Behavior:**
- Sets \`isRead\` flag to true
- Sets \`readAt\` timestamp to current time
- Idempotent: marking an already-read notification has no effect

**Requirements:**
- Validates: Requirements 13.5

**Response:**
- Success message on successful update

**Use Cases:**
- Mark notification as read when user views it
- Dismiss individual notifications
- Update notification status in UI
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Notification marked as read successfully",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Cannot mark notifications belonging to other users",
          },
          404: {
            description: "Notification not found",
          },
        },
      },
    }
  )
  // POST /notifications/read-all - Mark all notifications as read
  .post(
    "/read-all",
    async ({ authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new NotificationError(
          NotificationErrorCode.FORBIDDEN,
          "Authentication required",
          401
        );
      }

      await notificationService.markAllAsRead(userId);

      return {
        message: "All notifications marked as read",
      };
    },
    {
      detail: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        description: `
Mark all unread notifications as read for the authenticated user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Update Behavior:**
- Marks all unread notifications as read
- Sets \`isRead\` flag to true for all unread notifications
- Sets \`readAt\` timestamp to current time for all updated notifications
- Only affects notifications belonging to the authenticated user
- Idempotent: safe to call multiple times

**Requirements:**
- Validates: Requirements 13.5

**Response:**
- Success message on successful update

**Use Cases:**
- "Mark all as read" button in notification center
- Clear all notifications at once
- Bulk notification management
- Reset notification count to zero
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All notifications marked as read successfully",
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    }
  );
