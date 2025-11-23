import { describe, expect, it } from "bun:test";
import {
  applyPagination,
  buildLimitOffset,
  createCursorPaginationMeta,
  createPaginationMeta,
  decodeCursor,
  encodeCursor,
  validateCursorPaginationParams,
  validatePaginationParams,
  validateSortParams,
} from "./pagination";

describe("Pagination Utilities", () => {
  describe("validatePaginationParams", () => {
    it("should use default values when no parameters provided", () => {
      const result = validatePaginationParams();
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it("should accept valid limit and offset", () => {
      const result = validatePaginationParams(25, 10);
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(10);
    });

    it("should parse string parameters", () => {
      const result = validatePaginationParams("30", "5");
      expect(result.limit).toBe(30);
      expect(result.offset).toBe(5);
    });

    it("should throw error for limit below minimum", () => {
      expect(() => validatePaginationParams(0, 0)).toThrow();
    });

    it("should throw error for limit above maximum", () => {
      expect(() => validatePaginationParams(101, 0)).toThrow();
    });

    it("should throw error for negative offset", () => {
      expect(() => validatePaginationParams(50, -1)).toThrow();
    });
  });

  describe("validateCursorPaginationParams", () => {
    it("should use default limit when not provided", () => {
      const result = validateCursorPaginationParams();
      expect(result.limit).toBe(50);
      expect(result.cursor).toBeUndefined();
    });

    it("should accept valid cursor", () => {
      const cursor = encodeCursor("test-id");
      const result = validateCursorPaginationParams(25, cursor);
      expect(result.limit).toBe(25);
      expect(result.cursor).toBe(cursor);
    });
  });

  describe("validateSortParams", () => {
    it("should return null when no sortBy provided", () => {
      const result = validateSortParams();
      expect(result).toBeNull();
    });

    it("should accept valid sort parameters", () => {
      const result = validateSortParams("name", "desc", ["name", "createdAt"]);
      expect(result).toEqual({
        field: "name",
        direction: "desc",
      });
    });

    it("should default to asc direction", () => {
      const result = validateSortParams("name", undefined, ["name"]);
      expect(result?.direction).toBe("asc");
    });

    it("should throw error for invalid sort field", () => {
      expect(() =>
        validateSortParams("invalid", "asc", ["name", "createdAt"])
      ).toThrow();
    });

    it("should throw error for invalid sort direction", () => {
      expect(() => validateSortParams("name", "invalid", ["name"])).toThrow();
    });
  });

  describe("createPaginationMeta", () => {
    it("should create correct metadata", () => {
      const meta = createPaginationMeta(100, 25, 0);
      expect(meta.total).toBe(100);
      expect(meta.limit).toBe(25);
      expect(meta.offset).toBe(0);
      expect(meta.hasMore).toBe(true);
    });

    it("should indicate no more results", () => {
      const meta = createPaginationMeta(100, 25, 80);
      expect(meta.hasMore).toBe(false);
    });
  });

  describe("createCursorPaginationMeta", () => {
    it("should create cursor metadata with next cursor", () => {
      const items = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
      ];
      const meta = createCursorPaginationMeta(items, 2);
      expect(meta.limit).toBe(2);
      expect(meta.hasMore).toBe(true);
      expect(meta.nextCursor).toBeDefined();
    });

    it("should indicate no more results", () => {
      const items = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ];
      const meta = createCursorPaginationMeta(items, 5);
      expect(meta.hasMore).toBe(false);
      expect(meta.nextCursor).toBeUndefined();
    });
  });

  describe("encodeCursor and decodeCursor", () => {
    it("should encode and decode string cursor", () => {
      const original = "test-id-123";
      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);
      expect(decoded).toBe(original);
    });

    it("should encode and decode number cursor", () => {
      const original = 12345;
      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);
      expect(decoded).toBe(String(original));
    });

    it("should encode and decode date cursor", () => {
      const original = new Date("2024-01-01");
      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);
      expect(decoded).toBe(original.toISOString());
    });

    it("should decode any base64 string", () => {
      // Base64 decoder doesn't throw, it just decodes whatever it can
      const result = decodeCursor("dGVzdA=="); // "test" in base64
      expect(result).toBe("test");
    });
  });

  describe("applyPagination", () => {
    it("should paginate array correctly", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const result = applyPagination(items, { limit: 10, offset: 20 });
      expect(result.data.length).toBe(10);
      expect(result.data[0].id).toBe(20);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.hasMore).toBe(true);
    });

    it("should handle last page correctly", () => {
      const items = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const result = applyPagination(items, { limit: 10, offset: 20 });
      expect(result.data.length).toBe(5);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe("buildLimitOffset", () => {
    it("should return limit and offset", () => {
      const result = buildLimitOffset({ limit: 25, offset: 10 });
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(10);
    });
  });
});
