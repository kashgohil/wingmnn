/**
 * Base class for all domain errors
 * Provides consistent error structure across the application
 */
export abstract class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Validation error - 400 Bad Request
 * Used when input data fails validation
 */
export class ValidationError extends DomainError {
  constructor(message: string, details?: any) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

/**
 * Authentication error - 401 Unauthorized
 * Used when authentication is required or fails
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
  }
}

/**
 * Authorization error - 403 Forbidden
 * Used when user lacks permission to access resource
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = "Access forbidden") {
    super("FORBIDDEN", message, 403);
  }
}

/**
 * Not found error - 404 Not Found
 * Used when requested resource does not exist
 */
export class NotFoundError extends DomainError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super("NOT_FOUND", message, 404);
  }
}

/**
 * Conflict error - 409 Conflict
 * Used when operation conflicts with current state
 */
export class ConflictError extends DomainError {
  constructor(message: string, details?: any) {
    super("CONFLICT", message, 409, details);
  }
}

/**
 * Internal server error - 500 Internal Server Error
 * Used for unexpected errors
 */
export class InternalServerError extends DomainError {
  constructor(message: string = "An unexpected error occurred", details?: any) {
    super("INTERNAL_ERROR", message, 500, details);
  }
}

/**
 * Check if an error is a domain error
 */
export function isDomainError(error: any): error is DomainError {
  return error instanceof DomainError;
}
