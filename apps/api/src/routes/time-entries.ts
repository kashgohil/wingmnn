import { Elysia, t } from "elysia";
import { config } from "../config";
import { rateLimit } from "../middleware/rate-limit";
import {
  TimeTrackingError,
  TimeTrackingErrorCode,
  timeTrackingService,
} from "../services/time-tracking.service";

/**
 * Time entry routes plugin
 * Provides endpoints for time tracking, including creating, updating, deleting time entries and generating summaries
 */
export const timeEntryRoutes = new Elysia({ prefix: "/time-entries" })
  .decorate("authenticated", false as boolean)
  .decorate("userId", null as string | null)
  .decorate("sessionId", null as string | null)
  .decorate("accessToken", null as string | null)
  // Apply rate limiting to all time entry endpoints
  .onBeforeHandle(
    rateLimit({
      max: config.API_RATE_LIMIT,
      window: config.API_RATE_WINDOW,
      endpoint: "time-entries",
    })
  )
  .onError(({ code, error, set }) => {
    // Handle TimeTrackingError
    if (error instanceof TimeTrackingError) {
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
    console.error("Unexpected error in time entry routes:", error);
    set.status = 500;
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  })
  // POST /time-entries - Create a new time entry
  .post(
    "/",
    async ({ body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      // Parse date
      const createData = {
        ...body,
        date: new Date(body.date),
      };

      const timeEntry = await timeTrackingService.createTimeEntry(
        createData,
        userId
      );

      return {
        timeEntry,
      };
    },
    {
      body: t.Object({
        relatedEntityType: t.Union([t.Literal("task"), t.Literal("subtask")]),
        relatedEntityId: t.String(),
        durationMinutes: t.Number({ minimum: 1 }),
        date: t.String(),
        description: t.Optional(t.String({ maxLength: 1000 })),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "Create a new time entry",
        description: `
Create a new time entry for a task or subtask.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the task or subtask's project
- Returns 403 if user has no access to the project
- Returns 404 if task or subtask doesn't exist

**Time Entry Creation:**
- Duration must be a positive integer in minutes
- Date is required and should be in ISO 8601 format
- Description is optional (max 1000 characters)
- Time entry is associated with the authenticated user

**Validation:**
- Related entity (task or subtask) must exist and be accessible
- Duration must be at least 1 minute
- Date must be a valid date string

**Requirements:**
- Validates: Requirements 7.1, 7.6

**Response:**
- Created time entry object with ID and all metadata
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Time entry created successfully",
          },
          400: {
            description: "Validation error or invalid duration",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to log time for this task/subtask",
          },
          404: {
            description: "Task or subtask not found",
          },
        },
      },
    }
  )
  // GET /time-entries - List time entries with filters
  .get(
    "/",
    async ({ query, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      // Parse query parameters
      const filters: any = {
        userId: query.userId,
        relatedEntityType: query.relatedEntityType,
        relatedEntityId: query.relatedEntityId,
        limit: query.limit ? parseInt(query.limit) : undefined,
        offset: query.offset ? parseInt(query.offset) : undefined,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      };

      // Parse date filters
      if (query.dateFrom) {
        filters.dateFrom = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filters.dateTo = new Date(query.dateTo);
      }

      const timeEntries = await timeTrackingService.listTimeEntries(
        filters,
        userId
      );

      return {
        timeEntries,
      };
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
        relatedEntityType: t.Optional(
          t.Union([t.Literal("task"), t.Literal("subtask")])
        ),
        relatedEntityId: t.Optional(t.String()),
        dateFrom: t.Optional(t.String()),
        dateTo: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortDirection: t.Optional(
          t.Union([t.Literal("asc"), t.Literal("desc")])
        ),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "List time entries with filters",
        description: `
List time entries with optional filtering.

**Authentication Required:**
- Must include valid access token in Authorization header

**Filtering:**
- \`userId\`: Filter by user (defaults to authenticated user if not specified)
- \`relatedEntityType\`: Filter by entity type (task or subtask)
- \`relatedEntityId\`: Filter by specific task or subtask
- \`dateFrom\`: Filter by date (entries on or after this date)
- \`dateTo\`: Filter by date (entries on or before this date)

**Pagination:**
- \`limit\`: Maximum number of entries to return (default: 50, max: 100)
- \`offset\`: Number of entries to skip (default: 0)

**Sorting:**
- \`sortBy\`: Field to sort by (e.g., 'date', 'durationMinutes', 'createdAt')
- \`sortDirection\`: Sort direction ('asc' or 'desc', default: 'desc' for date)

**Authorization:**
- Only returns time entries for tasks/subtasks the user has access to
- If userId is specified, returns entries for that user (if accessible)
- Entries are automatically filtered by project access

**Requirements:**
- Validates: Requirements 7.4

**Response:**
- Array of time entry objects matching the filters
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of time entries",
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    }
  )
  // GET /time-entries/:id - Get time entry details
  .get(
    "/:id",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      const timeEntry = await timeTrackingService.getTimeEntry(
        params.id,
        userId
      );

      if (!timeEntry) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.TIME_ENTRY_NOT_FOUND,
          "Time entry not found or access denied",
          404
        );
      }

      return {
        timeEntry,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "Get time entry details",
        description: `
Get detailed information about a specific time entry.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the time entry's related task or subtask
- Returns 404 if time entry doesn't exist or user has no access

**Response:**
- Complete time entry object with all metadata
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Time entry details",
          },
          401: {
            description: "Authentication required",
          },
          404: {
            description: "Time entry not found or access denied",
          },
        },
      },
    }
  )
  // PUT /time-entries/:id - Update time entry
  .put(
    "/:id",
    async ({ params, body, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      // Parse date if provided
      const updateData: any = { ...body };
      if (body.date) {
        updateData.date = new Date(body.date);
      }

      const timeEntry = await timeTrackingService.updateTimeEntry(
        params.id,
        updateData,
        userId
      );

      return {
        timeEntry,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        durationMinutes: t.Optional(t.Number({ minimum: 1 })),
        date: t.Optional(t.String()),
        description: t.Optional(t.String({ maxLength: 1000 })),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "Update time entry",
        description: `
Update time entry properties.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the time entry's related task or subtask
- Only the user who created the time entry can update it
- Returns 404 if time entry doesn't exist or user has no access
- Returns 403 if user is not the creator of the time entry

**Update Behavior:**
- All fields are optional (only provided fields are updated)
- Duration must be a positive integer if provided
- Date must be a valid date string if provided

**Requirements:**
- Validates: Requirements 7.2

**Response:**
- Updated time entry object with new values
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Time entry updated successfully",
          },
          400: {
            description: "Validation error or invalid duration",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Can only update your own time entries",
          },
          404: {
            description: "Time entry not found or access denied",
          },
        },
      },
    }
  )
  // DELETE /time-entries/:id - Delete a time entry
  .delete(
    "/:id",
    async ({ params, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      await timeTrackingService.deleteTimeEntry(params.id, userId);

      return {
        message: "Time entry deleted successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "Delete a time entry",
        description: `
Delete a time entry.

**Authentication Required:**
- Must include valid access token in Authorization header

**Authorization:**
- User must have access to the time entry's related task or subtask
- Only the user who created the time entry can delete it
- Returns 404 if time entry doesn't exist or user has no access
- Returns 403 if user is not the creator of the time entry

**Deletion:**
- Time entry is permanently removed from the database
- This action cannot be undone

**Requirements:**
- Validates: Requirements 7.3

**Response:**
- Success message on successful deletion
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Time entry deleted successfully",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Can only delete your own time entries",
          },
          404: {
            description: "Time entry not found or access denied",
          },
        },
      },
    }
  )
  // GET /time-entries/summary - Get time summary
  .get(
    "/summary",
    async ({ query, authenticated, userId }) => {
      // Check authentication
      if (!authenticated || !userId) {
        throw new TimeTrackingError(
          TimeTrackingErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        );
      }

      // Parse query parameters
      const filters: any = {
        userId: query.userId,
        projectId: query.projectId,
        taskId: query.taskId,
        subtaskId: query.subtaskId,
        groupBy: query.groupBy,
      };

      // Parse date filters
      if (query.dateFrom) {
        filters.dateFrom = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filters.dateTo = new Date(query.dateTo);
      }

      const summary = await timeTrackingService.getTimeSummary(filters, userId);

      return {
        summary,
      };
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
        taskId: t.Optional(t.String()),
        subtaskId: t.Optional(t.String()),
        dateFrom: t.Optional(t.String()),
        dateTo: t.Optional(t.String()),
        groupBy: t.Optional(
          t.Union([t.Literal("task"), t.Literal("user"), t.Literal("date")])
        ),
      }),
      detail: {
        tags: ["Time Tracking"],
        summary: "Get time summary",
        description: `
Calculate time summary with optional grouping.

**Authentication Required:**
- Must include valid access token in Authorization header

**Filtering:**
- \`userId\`: Filter by user
- \`projectId\`: Filter by project (all tasks and subtasks in the project)
- \`taskId\`: Filter by specific task
- \`subtaskId\`: Filter by specific subtask
- \`dateFrom\`: Filter by date (entries on or after this date)
- \`dateTo\`: Filter by date (entries on or before this date)

**Grouping:**
- \`groupBy\`: Group results by 'task', 'user', or 'date' (defaults to 'task')
- Task grouping: Groups by task or subtask ID
- User grouping: Groups by user ID
- Date grouping: Groups by date (YYYY-MM-DD format)

**Authorization:**
- Only includes time entries for tasks/subtasks the user has access to
- If projectId is specified, checks access to that project
- Automatically filters by project membership

**Response:**
- \`totalMinutes\`: Total time across all matching entries
- \`entries\`: Array of grouped entries with:
  - \`groupKey\`: The grouping key (task ID, user ID, or date)
  - \`totalMinutes\`: Total time for this group
  - \`entryCount\`: Number of entries in this group

**Requirements:**
- Validates: Requirements 7.5

**Use Cases:**
- Calculate total time spent on a project
- See time breakdown by task
- Generate time reports by user or date
- Track project progress and effort
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Time summary",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Not authorized to access this project",
          },
        },
      },
    }
  );
