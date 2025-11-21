import { Elysia } from "elysia";
import { ZodError } from "zod";
import { AuthError, AuthErrorCode } from "../services/auth.service";

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
 * Global error handling middleware
 * Catches and formats all errors with appropriate status codes and user-friendly messages
 */
export const errorHandler = () =>
  new Elysia({ name: "errorHandler" }).onError(({ code, error, set }) => {
    // Handle AuthError
    if (error instanceof AuthError) {
      set.status = error.statusCode;
      return {
        error: error.code,
        message: error.message,
      };
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      set.status = 400;
      return formatZodError(error);
    }

    // Handle Elysia validation errors
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.message,
      };
    }

    // Handle NOT_FOUND errors
    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "NOT_FOUND",
        message: "Resource not found",
      };
    }

    // Handle PARSE errors (invalid JSON, etc.)
    if (code === "PARSE") {
      set.status = 400;
      return {
        error: "PARSE_ERROR",
        message: "Invalid request format",
      };
    }

    // Handle UNKNOWN errors (catch-all)
    if (code === "UNKNOWN") {
      // Log the error for debugging (in production, use proper logging)
      console.error("Unexpected error:", error);

      set.status = 500;
      return {
        error: AuthErrorCode.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      };
    }

    // Default error response
    console.error("Unhandled error:", error);
    set.status = 500;
    return {
      error: AuthErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred",
    };
  });
