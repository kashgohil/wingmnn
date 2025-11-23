/**
 * Pagination utilities for API endpoints
 * Supports both offset-based and cursor-based pagination
 */

import { ValidationError } from "../errors/domain-errors";

/**
 * Pagination parameters for offset-based pagination
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Pagination metadata for responses
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  limit: number;
  cursor?: string;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  limit: number;
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/**
 * Default pagination limits
 */
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;
export const MIN_LIMIT = 1;

/**
 * Validate and normalize pagination parameters
 */
export function validatePaginationParams(
  limit?: number | string,
  offset?: number | string
): PaginationParams {
  // Parse and validate limit
  const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : limit;
  const validatedLimit =
    parsedLimit !== undefined && !isNaN(parsedLimit)
      ? parsedLimit
      : DEFAULT_LIMIT;

  if (validatedLimit < MIN_LIMIT || validatedLimit > MAX_LIMIT) {
    throw new ValidationError(
      `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
      {
        limit: validatedLimit,
        min: MIN_LIMIT,
        max: MAX_LIMIT,
      }
    );
  }

  // Parse and validate offset
  const parsedOffset =
    typeof offset === "string" ? parseInt(offset, 10) : offset;
  const validatedOffset =
    parsedOffset !== undefined && !isNaN(parsedOffset) ? parsedOffset : 0;

  if (validatedOffset < 0) {
    throw new ValidationError("Offset must be non-negative", {
      offset: validatedOffset,
    });
  }

  return {
    limit: validatedLimit,
    offset: validatedOffset,
  };
}

/**
 * Validate and normalize cursor pagination parameters
 */
export function validateCursorPaginationParams(
  limit?: number | string,
  cursor?: string
): CursorPaginationParams {
  // Parse and validate limit
  const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : limit;
  const validatedLimit =
    parsedLimit !== undefined && !isNaN(parsedLimit)
      ? parsedLimit
      : DEFAULT_LIMIT;

  if (validatedLimit < MIN_LIMIT || validatedLimit > MAX_LIMIT) {
    throw new ValidationError(
      `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
      {
        limit: validatedLimit,
        min: MIN_LIMIT,
        max: MAX_LIMIT,
      }
    );
  }

  return {
    limit: validatedLimit,
    cursor: cursor || undefined,
  };
}

/**
 * Validate sort parameters
 */
export function validateSortParams(
  sortBy?: string,
  sortDirection?: string,
  allowedFields: string[] = []
): SortParams | null {
  if (!sortBy) {
    return null;
  }

  // Validate sort field
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    throw new ValidationError(
      `Invalid sort field. Allowed fields: ${allowedFields.join(", ")}`,
      {
        sortBy,
        allowedFields,
      }
    );
  }

  // Validate sort direction
  const direction = (sortDirection?.toLowerCase() || "asc") as SortDirection;
  if (direction !== "asc" && direction !== "desc") {
    throw new ValidationError("Sort direction must be 'asc' or 'desc'", {
      sortDirection: direction,
    });
  }

  return {
    field: sortBy,
    direction,
  };
}

/**
 * Create pagination metadata from query results
 */
export function createPaginationMeta(
  total: number,
  limit: number,
  offset: number
): PaginationMeta {
  return {
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Create cursor pagination metadata
 */
export function createCursorPaginationMeta(
  items: any[],
  limit: number,
  cursorField: string = "id"
): CursorPaginationMeta {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1][cursorField])
      : undefined;

  return {
    limit,
    nextCursor,
    hasMore,
  };
}

/**
 * Encode a cursor value to base64
 */
export function encodeCursor(value: string | number | Date): string {
  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);
  return Buffer.from(stringValue).toString("base64");
}

/**
 * Decode a cursor value from base64
 */
export function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, "base64").toString("utf-8");
  } catch (error) {
    throw new ValidationError("Invalid cursor format", { cursor });
  }
}

/**
 * Apply pagination to a query result array (for in-memory pagination)
 */
export function applyPagination<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const { limit, offset } = params;
  const total = items.length;
  const data = items.slice(offset, offset + limit);

  return {
    data,
    pagination: createPaginationMeta(total, limit, offset),
  };
}

/**
 * Build SQL LIMIT and OFFSET clause
 */
export function buildLimitOffset(params: PaginationParams): {
  limit: number;
  offset: number;
} {
  return {
    limit: params.limit,
    offset: params.offset,
  };
}
