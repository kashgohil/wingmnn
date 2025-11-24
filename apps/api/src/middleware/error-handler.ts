import { Elysia } from "elysia";
import { ZodError } from "zod";
import { isDomainError } from "../errors/domain-errors";
import { ActivityLogError } from "../services/activity-log.service";
import { AssignmentError } from "../services/assignment.service";
import { AttachmentError } from "../services/attachment.service";
import { AuthError } from "../services/auth.service";
import { CommentError } from "../services/comment.service";
import { NotificationError } from "../services/notification.service";
import { ProjectError } from "../services/project.service";
import { SubtaskError } from "../services/subtask.service";
import { TagError } from "../services/tag.service";
import { TaskLinkError } from "../services/task-link.service";
import { TaskError } from "../services/task.service";
import { TimeTrackingError } from "../services/time-tracking.service";
import { WorkflowError } from "../services/workflow.service";

/**
 * Error response format
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

/**
 * Format Zod validation errors into user-friendly messages
 */
function formatZodError(error: ZodError): ErrorResponse {
  const errors = (error as any).errors || [];
  const firstError = errors[0];

  return {
    error: "VALIDATION_ERROR",
    message: firstError?.message || "Validation failed",
    details: errors.map((err: any) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

/**
 * Log error with context for debugging and monitoring
 */
function logError(error: any, context?: any) {
  const timestamp = new Date().toISOString();
  const statusCode = error.statusCode || error.status || 500;
  const errorInfo = {
    timestamp,
    name: error.name || "Error",
    message: error.message || "Unknown error",
    code: error.code,
    statusCode,
    stack: error.stack,
    ...context,
  };

  // Always log errors to console for visibility
  // In production, this should use a proper logging service (e.g., Winston, Pino)
  if (statusCode >= 500) {
    console.error("\n[ERROR] Server Error:", JSON.stringify(errorInfo, null, 2));
    // Also log stack trace separately for better readability
    if (error.stack) {
      console.error("[ERROR] Stack Trace:", error.stack);
    }
  } else if (statusCode >= 400) {
    console.warn("\n[WARN] Client Error:", JSON.stringify(errorInfo, null, 2));
  } else {
    console.log("\n[INFO] Error:", JSON.stringify(errorInfo, null, 2));
  }
}

/**
 * Check if error is a service error (any of the custom service error classes)
 */
function isServiceError(error: any): boolean {
  return (
    error instanceof AuthError ||
    error instanceof ProjectError ||
    error instanceof WorkflowError ||
    error instanceof TaskError ||
    error instanceof SubtaskError ||
    error instanceof TaskLinkError ||
    error instanceof AssignmentError ||
    error instanceof TimeTrackingError ||
    error instanceof CommentError ||
    error instanceof AttachmentError ||
    error instanceof ActivityLogError ||
    error instanceof NotificationError ||
    error instanceof TagError
  );
}

/**
 * Global error handling middleware
 * Catches and formats all errors with appropriate status codes and user-friendly messages
 * Implements Properties 87-92 from the design document
 */
export const errorHandler = () =>
  new Elysia({ name: "errorHandler" }).onError(
    ({ code, error, set, request }) => {
      // Extract request context for logging
      const requestContext = {
        method: request.method,
        url: request.url,
        headers: {
          userAgent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
        },
      };

      // Handle DomainError (base class for all domain errors)
      if (isDomainError(error)) {
        set.status = error.statusCode;
        logError(error, requestContext);
        const response = {
          error: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        };
        return response;
      }

      // Handle service-specific errors (AuthError, ProjectError, etc.)
      if (isServiceError(error)) {
        const serviceError = error as any;
        set.status = serviceError.statusCode || 400;
        logError(serviceError, requestContext);
        return {
          error: serviceError.code,
          message: serviceError.message,
          ...(serviceError.details && { details: serviceError.details }),
        };
      }

      // Handle Zod validation errors (Property 87: Invalid requests return 400)
      if (error instanceof ZodError) {
        set.status = 400;
        const formattedError = formatZodError(error);
        logError(error, {
          ...requestContext,
          validationErrors: formattedError.details,
        });
        return formattedError;
      }

      // Handle Elysia validation errors (Property 87: Invalid requests return 400)
      if (code === "VALIDATION") {
        set.status = 400;
        const errorResponse = {
          error: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.message,
        };
        logError(error, requestContext);
        return errorResponse;
      }

      // Handle NOT_FOUND errors (Property 90: Non-existent resources return 404)
      if (code === "NOT_FOUND") {
        set.status = 404;
        const errorResponse = {
          error: "NOT_FOUND",
          message: "Resource not found",
        };
        logError(error, requestContext);
        return errorResponse;
      }

      // Handle PARSE errors (invalid JSON, etc.) (Property 87: Invalid requests return 400)
      if (code === "PARSE") {
        set.status = 400;
        const errorResponse = {
          error: "PARSE_ERROR",
          message: "Invalid request format",
        };
        logError(error, requestContext);
        return errorResponse;
      }

      // Handle UNKNOWN errors (catch-all for unexpected errors)
      if (code === "UNKNOWN") {
        set.status = 500;
        const errorResponse = {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        };
        logError(error, { ...requestContext, originalError: error });
        return errorResponse;
      }

      // Default error response for any unhandled error types
      set.status = 500;
      const errorResponse = {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      };
      logError(
        error,
        {
          ...requestContext,
          code,
          unhandledErrorType: true,
        },
      );
      return errorResponse;
    }
  );
