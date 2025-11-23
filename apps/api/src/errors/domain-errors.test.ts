import { describe, expect, test } from "bun:test";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  isDomainError,
} from "./domain-errors";

describe("Domain Errors", () => {
  describe("ValidationError", () => {
    test("should create validation error with correct properties", () => {
      const error = new ValidationError("Invalid input", { field: "email" });

      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: "email" });
    });

    test("should convert to JSON format", () => {
      const error = new ValidationError("Invalid input", { field: "email" });
      const json = error.toJSON();

      expect(json).toEqual({
        error: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email" },
      });
    });
  });

  describe("UnauthorizedError", () => {
    test("should create unauthorized error with default message", () => {
      const error = new UnauthorizedError();

      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
    });

    test("should create unauthorized error with custom message", () => {
      const error = new UnauthorizedError("Invalid token");

      expect(error.message).toBe("Invalid token");
    });
  });

  describe("ForbiddenError", () => {
    test("should create forbidden error with default message", () => {
      const error = new ForbiddenError();

      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toBe("Access forbidden");
      expect(error.statusCode).toBe(403);
    });

    test("should create forbidden error with custom message", () => {
      const error = new ForbiddenError("Not project owner");

      expect(error.message).toBe("Not project owner");
    });
  });

  describe("NotFoundError", () => {
    test("should create not found error without identifier", () => {
      const error = new NotFoundError("Project");

      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("Project not found");
      expect(error.statusCode).toBe(404);
    });

    test("should create not found error with identifier", () => {
      const error = new NotFoundError("Project", "proj_123");

      expect(error.message).toBe("Project with ID 'proj_123' not found");
    });
  });

  describe("ConflictError", () => {
    test("should create conflict error", () => {
      const error = new ConflictError("Resource already exists", {
        resource: "tag",
      });

      expect(error.code).toBe("CONFLICT");
      expect(error.message).toBe("Resource already exists");
      expect(error.statusCode).toBe(409);
      expect(error.details).toEqual({ resource: "tag" });
    });
  });

  describe("InternalServerError", () => {
    test("should create internal server error with default message", () => {
      const error = new InternalServerError();

      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.message).toBe("An unexpected error occurred");
      expect(error.statusCode).toBe(500);
    });

    test("should create internal server error with custom message", () => {
      const error = new InternalServerError("Database connection failed");

      expect(error.message).toBe("Database connection failed");
    });
  });

  describe("isDomainError", () => {
    test("should return true for domain errors", () => {
      expect(isDomainError(new ValidationError("test"))).toBe(true);
      expect(isDomainError(new UnauthorizedError())).toBe(true);
      expect(isDomainError(new ForbiddenError())).toBe(true);
      expect(isDomainError(new NotFoundError("test"))).toBe(true);
      expect(isDomainError(new ConflictError("test"))).toBe(true);
      expect(isDomainError(new InternalServerError())).toBe(true);
    });

    test("should return false for non-domain errors", () => {
      expect(isDomainError(new Error("test"))).toBe(false);
      expect(isDomainError(null)).toBe(false);
      expect(isDomainError(undefined)).toBe(false);
      expect(isDomainError("error")).toBe(false);
    });
  });

  describe("Error stack traces", () => {
    test("should capture stack trace", () => {
      const error = new ValidationError("test");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ValidationError");
    });

    test("should have correct error name", () => {
      const validationError = new ValidationError("test");
      const unauthorizedError = new UnauthorizedError();
      const forbiddenError = new ForbiddenError();

      expect(validationError.name).toBe("ValidationError");
      expect(unauthorizedError.name).toBe("UnauthorizedError");
      expect(forbiddenError.name).toBe("ForbiddenError");
    });
  });
});
