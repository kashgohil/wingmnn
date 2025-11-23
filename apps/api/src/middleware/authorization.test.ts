import { beforeEach, describe, expect, mock, test } from "bun:test";
import { projectService } from "../services/project.service";
import { authorizationService } from "./authorization";

// Mock the project service
const mockCheckAccess = mock(() => Promise.resolve(true));
const mockCheckOwnership = mock(() => Promise.resolve(true));

// Override project service methods for testing
(projectService as any).checkAccess = mockCheckAccess;
(projectService as any).checkOwnership = mockCheckOwnership;

describe("AuthorizationService", () => {
  beforeEach(() => {
    mockCheckAccess.mockClear();
    mockCheckOwnership.mockClear();
  });

  describe("checkProjectAccess", () => {
    test("should call projectService.checkAccess", async () => {
      mockCheckAccess.mockResolvedValue(true);

      const result = await authorizationService.checkProjectAccess(
        "project-1",
        "user-1"
      );

      expect(result).toBe(true);
      expect(mockCheckAccess).toHaveBeenCalledWith("project-1", "user-1");
    });

    test("should return false when user has no access", async () => {
      mockCheckAccess.mockResolvedValue(false);

      const result = await authorizationService.checkProjectAccess(
        "project-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("checkProjectOwnership", () => {
    test("should call projectService.checkOwnership", async () => {
      mockCheckOwnership.mockResolvedValue(true);

      const result = await authorizationService.checkProjectOwnership(
        "project-1",
        "user-1"
      );

      expect(result).toBe(true);
      expect(mockCheckOwnership).toHaveBeenCalledWith("project-1", "user-1");
    });

    test("should return false when user is not owner", async () => {
      mockCheckOwnership.mockResolvedValue(false);

      const result = await authorizationService.checkProjectOwnership(
        "project-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("checkProjectMembership", () => {
    test("should return true when user has access but is not owner", async () => {
      mockCheckAccess.mockResolvedValue(true);
      mockCheckOwnership.mockResolvedValue(false);

      const result = await authorizationService.checkProjectMembership(
        "project-1",
        "user-1"
      );

      expect(result).toBe(true);
    });

    test("should return false when user is owner", async () => {
      mockCheckAccess.mockResolvedValue(true);
      mockCheckOwnership.mockResolvedValue(true);

      const result = await authorizationService.checkProjectMembership(
        "project-1",
        "user-1"
      );

      expect(result).toBe(false);
    });

    test("should return false when user has no access", async () => {
      mockCheckAccess.mockResolvedValue(false);
      mockCheckOwnership.mockResolvedValue(false);

      const result = await authorizationService.checkProjectMembership(
        "project-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("verifyAssigneeEligibility", () => {
    test("should return true when assignee has project access", async () => {
      mockCheckAccess.mockResolvedValue(true);

      const result = await authorizationService.verifyAssigneeEligibility(
        "project-1",
        "user-1"
      );

      expect(result).toBe(true);
    });

    test("should return false when assignee has no project access", async () => {
      mockCheckAccess.mockResolvedValue(false);

      const result = await authorizationService.verifyAssigneeEligibility(
        "project-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("checkModifyPermission", () => {
    test("should check ownership when requireOwnership is true", async () => {
      mockCheckOwnership.mockResolvedValue(true);

      const result = await authorizationService.checkModifyPermission(
        "project-1",
        "user-1",
        true
      );

      expect(result).toBe(true);
      expect(mockCheckOwnership).toHaveBeenCalledWith("project-1", "user-1");
    });

    test("should check access when requireOwnership is false", async () => {
      mockCheckAccess.mockResolvedValue(true);

      const result = await authorizationService.checkModifyPermission(
        "project-1",
        "user-1",
        false
      );

      expect(result).toBe(true);
      expect(mockCheckAccess).toHaveBeenCalledWith("project-1", "user-1");
    });

    test("should default to checking access when requireOwnership is not provided", async () => {
      mockCheckAccess.mockResolvedValue(true);

      const result = await authorizationService.checkModifyPermission(
        "project-1",
        "user-1"
      );

      expect(result).toBe(true);
      expect(mockCheckAccess).toHaveBeenCalledWith("project-1", "user-1");
    });
  });
});
