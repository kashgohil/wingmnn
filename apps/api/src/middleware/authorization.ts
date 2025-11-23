import { Elysia } from "elysia";
import { projectService } from "../services/project.service";

/**
 * Authorization middleware for project-based resources
 * Checks if the authenticated user has access to a project
 */
export const requireProjectAccess = () =>
  new Elysia({ name: "requireProjectAccess" }).onBeforeHandle(
    { as: "global" },
    async ({ params, authenticated, userId, set }: any) => {
      if (!authenticated) {
        set.status = 401;
        return {
          error: "Unauthorized",
          message: "Authentication required",
        };
      }

      // Extract projectId from params
      const projectId = params.projectId || params.id;

      if (!projectId) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "Project ID is required",
        };
      }

      // Check if user has access to the project
      const hasAccess = await projectService.checkAccess(projectId, userId);

      if (!hasAccess) {
        set.status = 403;
        return {
          error: "Forbidden",
          message: "You do not have access to this project",
        };
      }
    }
  );

/**
 * Authorization middleware for project ownership
 * Checks if the authenticated user is the owner of a project
 */
export const requireProjectOwnership = () =>
  new Elysia({ name: "requireProjectOwnership" }).onBeforeHandle(
    { as: "global" },
    async ({ params, authenticated, userId, set }: any) => {
      if (!authenticated) {
        set.status = 401;
        return {
          error: "Unauthorized",
          message: "Authentication required",
        };
      }

      // Extract projectId from params
      const projectId = params.projectId || params.id;

      if (!projectId) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "Project ID is required",
        };
      }

      // Check if user is the owner of the project
      const isOwner = await projectService.checkOwnership(projectId, userId);

      if (!isOwner) {
        set.status = 403;
        return {
          error: "Forbidden",
          message: "Only the project owner can perform this action",
        };
      }
    }
  );

/**
 * Authorization helper functions
 * These can be used within services for fine-grained access control
 */
export class AuthorizationService {
  /**
   * Check if a user has access to a project
   * This includes:
   * - Project owner
   * - Direct project member
   * - Member through user group
   */
  async checkProjectAccess(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    return await projectService.checkAccess(projectId, userId);
  }

  /**
   * Check if a user is the owner of a project
   */
  async checkProjectOwnership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    return await projectService.checkOwnership(projectId, userId);
  }

  /**
   * Check if a user is a member of a project (direct or through group)
   * This excludes ownership check
   */
  async checkProjectMembership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const hasAccess = await projectService.checkAccess(projectId, userId);
    const isOwner = await projectService.checkOwnership(projectId, userId);

    // User is a member if they have access but are not the owner
    return hasAccess && !isOwner;
  }

  /**
   * Verify that a user can be assigned to a task/subtask
   * User must be a project member (owner or member)
   */
  async verifyAssigneeEligibility(
    projectId: string,
    assigneeId: string
  ): Promise<boolean> {
    return await projectService.checkAccess(projectId, assigneeId);
  }

  /**
   * Check if a user can modify a resource
   * For most resources, any project member can modify
   * For project settings, only owner can modify
   */
  async checkModifyPermission(
    projectId: string,
    userId: string,
    requireOwnership: boolean = false
  ): Promise<boolean> {
    if (requireOwnership) {
      return await projectService.checkOwnership(projectId, userId);
    }
    return await projectService.checkAccess(projectId, userId);
  }
}

// Export singleton instance
export const authorizationService = new AuthorizationService();
