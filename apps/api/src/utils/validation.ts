import { ValidationError } from "../errors/domain-errors";

/**
 * Validation utilities for common validation patterns
 */

/**
 * Validate that a date range is valid (start <= end)
 */
export function validateDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  fieldNames: { start: string; end: string } = {
    start: "startDate",
    end: "endDate",
  }
): void {
  if (startDate && endDate && startDate > endDate) {
    throw new ValidationError(
      `${fieldNames.start} must be before or equal to ${fieldNames.end}`,
      {
        [fieldNames.start]: startDate.toISOString(),
        [fieldNames.end]: endDate.toISOString(),
      }
    );
  }
}

/**
 * Validate that a value is within a range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      { value, min, max }
    );
  }
}

/**
 * Validate that a value is positive
 */
export function validatePositive(value: number, fieldName: string): void {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`, { value });
  }
}

/**
 * Validate that a value is non-negative
 */
export function validateNonNegative(value: number, fieldName: string): void {
  if (value < 0) {
    throw new ValidationError(`${fieldName} must be non-negative`, { value });
  }
}

/**
 * Validate that a string is not empty or whitespace only
 */
export function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string
): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      { value, allowedValues }
    );
  }
}

/**
 * Validate that a file size is within limits
 */
export function validateFileSize(
  size: number,
  maxSize: number,
  fieldName: string = "file"
): void {
  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const actualSizeMB = (size / (1024 * 1024)).toFixed(2);
    throw new ValidationError(
      `${fieldName} size (${actualSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      { size, maxSize }
    );
  }
}

/**
 * Validate that a MIME type is allowed
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[],
  fieldName: string = "file"
): void {
  if (!allowedTypes.includes(mimeType)) {
    throw new ValidationError(
      `${fieldName} type '${mimeType}' is not allowed. Allowed types: ${allowedTypes.join(
        ", "
      )}`,
      { mimeType, allowedTypes }
    );
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validatedLimit = limit !== undefined ? limit : 50;
  const validatedOffset = offset !== undefined ? offset : 0;

  if (validatedLimit < 1 || validatedLimit > 100) {
    throw new ValidationError("Limit must be between 1 and 100", {
      limit: validatedLimit,
    });
  }

  if (validatedOffset < 0) {
    throw new ValidationError("Offset must be non-negative", {
      offset: validatedOffset,
    });
  }

  return { limit: validatedLimit, offset: validatedOffset };
}

/**
 * Validate that required fields are present
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

/**
 * Validate email format (basic validation)
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format", { email });
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string, fieldName: string = "id"): void {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`, { id });
  }
}
