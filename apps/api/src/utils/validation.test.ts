import { describe, expect, test } from "bun:test";
import { ValidationError } from "../errors/domain-errors";
import {
  validateDateRange,
  validateEmail,
  validateEnum,
  validateFileSize,
  validateMimeType,
  validateNonNegative,
  validateNotEmpty,
  validatePagination,
  validatePositive,
  validateRange,
  validateRequired,
  validateUUID,
} from "./validation";

describe("Validation Utilities", () => {
  describe("validateDateRange", () => {
    test("should pass when start date is before end date", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      expect(() => validateDateRange(start, end)).not.toThrow();
    });

    test("should pass when start date equals end date", () => {
      const date = new Date("2024-01-01");

      expect(() => validateDateRange(date, date)).not.toThrow();
    });

    test("should pass when dates are null or undefined", () => {
      expect(() => validateDateRange(null, null)).not.toThrow();
      expect(() => validateDateRange(undefined, undefined)).not.toThrow();
      expect(() => validateDateRange(new Date(), null)).not.toThrow();
      expect(() => validateDateRange(null, new Date())).not.toThrow();
    });

    test("should throw when start date is after end date", () => {
      const start = new Date("2024-01-31");
      const end = new Date("2024-01-01");

      expect(() => validateDateRange(start, end)).toThrow(ValidationError);
    });
  });

  describe("validateRange", () => {
    test("should pass when value is within range", () => {
      expect(() => validateRange(50, 0, 100, "progress")).not.toThrow();
      expect(() => validateRange(0, 0, 100, "progress")).not.toThrow();
      expect(() => validateRange(100, 0, 100, "progress")).not.toThrow();
    });

    test("should throw when value is below minimum", () => {
      expect(() => validateRange(-1, 0, 100, "progress")).toThrow(
        ValidationError
      );
    });

    test("should throw when value is above maximum", () => {
      expect(() => validateRange(101, 0, 100, "progress")).toThrow(
        ValidationError
      );
    });
  });

  describe("validatePositive", () => {
    test("should pass when value is positive", () => {
      expect(() => validatePositive(1, "duration")).not.toThrow();
      expect(() => validatePositive(100, "duration")).not.toThrow();
    });

    test("should throw when value is zero", () => {
      expect(() => validatePositive(0, "duration")).toThrow(ValidationError);
    });

    test("should throw when value is negative", () => {
      expect(() => validatePositive(-1, "duration")).toThrow(ValidationError);
    });
  });

  describe("validateNonNegative", () => {
    test("should pass when value is non-negative", () => {
      expect(() => validateNonNegative(0, "count")).not.toThrow();
      expect(() => validateNonNegative(1, "count")).not.toThrow();
      expect(() => validateNonNegative(100, "count")).not.toThrow();
    });

    test("should throw when value is negative", () => {
      expect(() => validateNonNegative(-1, "count")).toThrow(ValidationError);
    });
  });

  describe("validateNotEmpty", () => {
    test("should pass when string is not empty", () => {
      expect(() => validateNotEmpty("hello", "name")).not.toThrow();
      expect(() => validateNotEmpty("  hello  ", "name")).not.toThrow();
    });

    test("should throw when string is empty", () => {
      expect(() => validateNotEmpty("", "name")).toThrow(ValidationError);
    });

    test("should throw when string is only whitespace", () => {
      expect(() => validateNotEmpty("   ", "name")).toThrow(ValidationError);
    });
  });

  describe("validateEnum", () => {
    test("should pass when value is in allowed values", () => {
      expect(() =>
        validateEnum("low", ["low", "medium", "high"], "priority")
      ).not.toThrow();
    });

    test("should throw when value is not in allowed values", () => {
      expect(() =>
        validateEnum("urgent", ["low", "medium", "high"], "priority")
      ).toThrow(ValidationError);
    });
  });

  describe("validateFileSize", () => {
    test("should pass when file size is within limit", () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const fileSize = 5 * 1024 * 1024; // 5MB

      expect(() => validateFileSize(fileSize, maxSize)).not.toThrow();
    });

    test("should throw when file size exceeds limit", () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const fileSize = 15 * 1024 * 1024; // 15MB

      expect(() => validateFileSize(fileSize, maxSize)).toThrow(
        ValidationError
      );
    });
  });

  describe("validateMimeType", () => {
    test("should pass when MIME type is allowed", () => {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      expect(() => validateMimeType("image/jpeg", allowedTypes)).not.toThrow();
    });

    test("should throw when MIME type is not allowed", () => {
      const allowedTypes = ["image/jpeg", "image/png"];

      expect(() => validateMimeType("application/pdf", allowedTypes)).toThrow(
        ValidationError
      );
    });
  });

  describe("validatePagination", () => {
    test("should return default values when no parameters provided", () => {
      const result = validatePagination();

      expect(result).toEqual({ limit: 50, offset: 0 });
    });

    test("should return provided values when valid", () => {
      const result = validatePagination(25, 10);

      expect(result).toEqual({ limit: 25, offset: 10 });
    });

    test("should throw when limit is below 1", () => {
      expect(() => validatePagination(0, 0)).toThrow(ValidationError);
    });

    test("should throw when limit is above 100", () => {
      expect(() => validatePagination(101, 0)).toThrow(ValidationError);
    });

    test("should throw when offset is negative", () => {
      expect(() => validatePagination(50, -1)).toThrow(ValidationError);
    });
  });

  describe("validateRequired", () => {
    test("should pass when value is provided", () => {
      expect(() => validateRequired("value", "field")).not.toThrow();
      expect(() => validateRequired(0, "field")).not.toThrow();
      expect(() => validateRequired(false, "field")).not.toThrow();
      expect(() => validateRequired("", "field")).not.toThrow();
    });

    test("should throw when value is null", () => {
      expect(() => validateRequired(null, "field")).toThrow(ValidationError);
    });

    test("should throw when value is undefined", () => {
      expect(() => validateRequired(undefined, "field")).toThrow(
        ValidationError
      );
    });
  });

  describe("validateEmail", () => {
    test("should pass for valid email addresses", () => {
      expect(() => validateEmail("user@example.com")).not.toThrow();
      expect(() => validateEmail("test.user@example.co.uk")).not.toThrow();
      expect(() => validateEmail("user+tag@example.com")).not.toThrow();
    });

    test("should throw for invalid email addresses", () => {
      expect(() => validateEmail("invalid")).toThrow(ValidationError);
      expect(() => validateEmail("@example.com")).toThrow(ValidationError);
      expect(() => validateEmail("user@")).toThrow(ValidationError);
      expect(() => validateEmail("user @example.com")).toThrow(ValidationError);
    });
  });

  describe("validateUUID", () => {
    test("should pass for valid UUIDs", () => {
      expect(() =>
        validateUUID("550e8400-e29b-41d4-a716-446655440000")
      ).not.toThrow();
      expect(() =>
        validateUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
      ).not.toThrow();
    });

    test("should throw for invalid UUIDs", () => {
      expect(() => validateUUID("invalid-uuid")).toThrow(ValidationError);
      expect(() => validateUUID("123")).toThrow(ValidationError);
      expect(() => validateUUID("550e8400-e29b-41d4-a716")).toThrow(
        ValidationError
      );
    });
  });
});
