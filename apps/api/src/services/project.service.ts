import {
  and,
  db,
  eq,
  inArray,
  or,
  projectMembers,
  projects,
  sql,
  tasks,
  userGroupMembers,
  workflows,
} from "@wingmnn/db";

/**
 * Project with relations
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  workflowId: string;
  status: "active" | "archived" | "on_hold" | "completed";
  statusUpdatedAt: Date | null;
  deleted: boolean | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project member
 */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string | null;
  userGroupId: string | null;
  addedBy: string;
  addedAt: Date | null;
}

/**
 * Input for creating a project
 */
export interface CreateProjectInput {
  name: string;
  description?: string;
  workflowId: string;
}

/**
 * Input for updating a project
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

/**
 * Input for adding a member
 */
export interface AddMemberInput {
  userId?: string;
  userGroupId?: string;
}

/**
 * Project error codes
 */
export enum ProjectErrorCode {
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  WORKFLOW_NOT_FOUND = "WORKFLOW_NOT_FOUND",
  WORKFLOW_IMMUTABLE = "WORKFLOW_IMMUTABLE",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_INPUT = "INVALID_INPUT",
  ARCHIVED_PROJECT = "ARCHIVED_PROJECT",
}

/**
 * Project error class
 */
export class ProjectError extends Error {
  constructor(
    public code: ProjectErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ProjectError";
  }
}

/**
 * Project Service
 * Handles project management, membership, and access control
 */
export class ProjectService {
  /**
   * Create a new project
   * @param data - Project creation data
   * @param userId - ID of the user creating the project
   * @returns Created project
   */
  async createProject(
    data: CreateProjectInput,
    userId: string
  ): Promise<Project> {
    // Verify workflow exists
    const workflowResult = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, data.workflowId))
      .limit(1);

    if (workflowResult.length === 0) {
      throw new ProjectError(
        ProjectErrorCode.WORKFLOW_NOT_FOUND,
        "Workflow not found",
        404
      );
    }

    const result = await db
      .insert(projects)
      .values({
        name: data.name,
        description: data.description || null,
        ownerId: userId,
        workflowId: data.workflowId,
        status: "active",
        statusUpdatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a project by ID
   * @param projectId - Project ID
   * @param userId - User ID requesting the project
   * @returns Project or null if not found or no access
   */
  async getProject(projectId: string, userId: string): Promise<Project | null> {
    // Check access first
    const hasAccess = await this.checkAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  /**
   * List projects accessible to a user
   * @param userId - User ID
   * @param status - Optional filter by project status
   * @returns List of projects
   */
  async listProjects(
    userId: string,
    status?: "active" | "archived" | "on_hold" | "completed"
  ): Promise<Project[]> {
    // Get all user's group IDs
    const userGroupsResult = await db
      .select({ groupId: userGroupMembers.groupId })
      .from(userGroupMembers)
      .where(eq(userGroupMembers.userId, userId));

    const userGroupIds = userGroupsResult.map((g) => g.groupId);

    // Build conditions for project access
    const accessConditions = [
      eq(projects.ownerId, userId), // User is owner
    ];

    // Add condition for direct membership
    const directMembershipSubquery = db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    // Add condition for group membership if user has groups
    if (userGroupIds.length > 0) {
      const groupMembershipSubquery = db
        .select({ projectId: projectMembers.projectId })
        .from(projectMembers)
        .where(inArray(projectMembers.userGroupId, userGroupIds));
    }

    // Query projects with access check
    const conditions = [or(...accessConditions)];

    // Add status filter if provided
    if (status) {
      conditions.push(eq(projects.status, status));
    }

    // Get projects where user is owner or member
    const ownedOrDirectMember = await db
      .select()
      .from(projects)
      .where(
        and(
          or(
            eq(projects.ownerId, userId),
            sql`${projects.id} IN (SELECT ${projectMembers.projectId} FROM ${projectMembers} WHERE ${projectMembers.userId} = ${userId})`
          ),
          status ? eq(projects.status, status) : sql`true`
        )
      );

    // Get projects where user is a group member
    let groupProjects: Project[] = [];
    if (userGroupIds.length > 0) {
      groupProjects = await db
        .select()
        .from(projects)
        .where(
          and(
            sql`${projects.id} IN (SELECT ${
              projectMembers.projectId
            } FROM ${projectMembers} WHERE ${
              projectMembers.userGroupId
            } IN (${sql.join(
              userGroupIds.map((id) => sql`${id}`),
              sql`, `
            )}))`,
            status ? eq(projects.status, status) : sql`true`
          )
        );
    }

    // Combine and deduplicate by project ID
    const allProjects = [...ownedOrDirectMember, ...groupProjects];
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [p.id, p])).values()
    );

    return uniqueProjects;
  }

  /**
   * Update a project
   * @param projectId - Project ID
   * @param data - Project update data
   * @param userId - User ID requesting the update
   * @returns Updated project
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectInput,
    userId: string
  ): Promise<Project> {
    // Check ownership
    const isOwner = await this.checkOwnership(projectId, userId);
    if (!isOwner) {
      throw new ProjectError(
        ProjectErrorCode.UNAUTHORIZED,
        "Only the project owner can update project details",
        403
      );
    }

    // Prevent workflow changes
    if ("workflowId" in data) {
      throw new ProjectError(
        ProjectErrorCode.WORKFLOW_IMMUTABLE,
        "Workflow cannot be changed after project creation",
        400
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: userId,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    const result = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    return result[0];
  }

  /**
   * Delete a project
   * @param projectId - Project ID
   * @param userId - User ID requesting deletion
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Check ownership
    const isOwner = await this.checkOwnership(projectId, userId);
    if (!isOwner) {
      throw new ProjectError(
        ProjectErrorCode.UNAUTHORIZED,
        "Only the project owner can delete the project",
        403
      );
    }

    // Delete project (cascade will handle related entities)
    await db.delete(projects).where(eq(projects.id, projectId));
  }

  /**
   * Update project status
   * @param projectId - Project ID
   * @param status - New status
   * @param userId - User ID requesting the update
   * @returns Updated project
   */
  async updateProjectStatus(
    projectId: string,
    status: "active" | "archived" | "on_hold" | "completed",
    userId: string
  ): Promise<Project> {
    // Check ownership
    const isOwner = await this.checkOwnership(projectId, userId);
    if (!isOwner) {
      throw new ProjectError(
        ProjectErrorCode.UNAUTHORIZED,
        "Only the project owner can change project status",
        403
      );
    }

    const result = await db
      .update(projects)
      .set({
        status,
        statusUpdatedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(projects.id, projectId))
      .returning();

    return result[0];
  }

  /**
   * Add a member to a project
   * @param projectId - Project ID
   * @param memberData - Member data (userId or userGroupId)
   * @param userId - User ID adding the member
   */
  async addMember(
    projectId: string,
    memberData: AddMemberInput,
    userId: string
  ): Promise<void> {
    // Check ownership
    const isOwner = await this.checkOwnership(projectId, userId);
    if (!isOwner) {
      throw new ProjectError(
        ProjectErrorCode.UNAUTHORIZED,
        "Only the project owner can add members",
        403
      );
    }

    // Validate input
    if (!memberData.userId && !memberData.userGroupId) {
      throw new ProjectError(
        ProjectErrorCode.INVALID_INPUT,
        "Either userId or userGroupId must be provided",
        400
      );
    }

    if (memberData.userId && memberData.userGroupId) {
      throw new ProjectError(
        ProjectErrorCode.INVALID_INPUT,
        "Cannot provide both userId and userGroupId",
        400
      );
    }

    await db.insert(projectMembers).values({
      id: crypto.randomUUID(),
      projectId,
      userId: memberData.userId || null,
      userGroupId: memberData.userGroupId || null,
      addedBy: userId,
      addedAt: new Date(),
    });
  }

  /**
   * Remove a member from a project
   * @param projectId - Project ID
   * @param memberId - Member ID to remove
   * @param userId - User ID removing the member
   */
  async removeMember(
    projectId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    // Check ownership
    const isOwner = await this.checkOwnership(projectId, userId);
    if (!isOwner) {
      throw new ProjectError(
        ProjectErrorCode.UNAUTHORIZED,
        "Only the project owner can remove members",
        403
      );
    }

    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.id, memberId),
          eq(projectMembers.projectId, projectId)
        )
      );
  }

  /**
   * List members of a project
   * @param projectId - Project ID
   * @param userId - User ID requesting the list
   * @returns List of project members
   */
  async listMembers(
    projectId: string,
    userId: string
  ): Promise<ProjectMember[]> {
    // Check access
    const hasAccess = await this.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new ProjectError(
        ProjectErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    const result = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    return result;
  }

  /**
   * Check if a user has access to a project
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns true if user has access, false otherwise
   */
  async checkAccess(projectId: string, userId: string): Promise<boolean> {
    // Check if user is the owner
    const projectResult = await db
      .select({ ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (projectResult.length === 0) {
      return false;
    }

    if (projectResult[0].ownerId === userId) {
      return true;
    }

    // Check if user is a direct member
    const directMember = await db
      .select({ id: projectMembers.id })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      )
      .limit(1);

    if (directMember.length > 0) {
      return true;
    }

    // Check if user is a member through a group
    const groupMember = await db
      .select({ id: projectMembers.id })
      .from(projectMembers)
      .innerJoin(
        userGroupMembers,
        eq(userGroupMembers.groupId, projectMembers.userGroupId)
      )
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(userGroupMembers.userId, userId)
        )
      )
      .limit(1);

    return groupMember.length > 0;
  }

  /**
   * Check if a user is the owner of a project
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns true if user is the owner, false otherwise
   */
  async checkOwnership(projectId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    return result[0].ownerId === userId;
  }

  /**
   * Check if a project is archived
   * @param projectId - Project ID
   * @returns true if project is archived, false otherwise
   */
  async isArchived(projectId: string): Promise<boolean> {
    const result = await db
      .select({ status: projects.status })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    return result[0].status === "archived";
  }

  /**
   * Calculate project progress as weighted average of all task progress
   * @param projectId - Project ID
   * @param userId - User ID requesting the calculation
   * @returns Progress percentage (0-100)
   */
  async calculateProjectProgress(
    projectId: string,
    userId: string
  ): Promise<number> {
    // Check access
    const hasAccess = await this.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new ProjectError(
        ProjectErrorCode.FORBIDDEN,
        "You do not have access to this project",
        403
      );
    }

    // Get all non-deleted tasks with their estimated points/hours and progress
    const taskResults = await db
      .select({
        progress: tasks.progress,
        estimatedPoints: tasks.estimatedPoints,
        estimatedHours: tasks.estimatedHours,
      })
      .from(tasks)
      .where(
        and(eq(tasks.projectId, projectId), sql`${tasks.deletedAt} IS NULL`)
      );

    if (taskResults.length === 0) {
      return 0;
    }

    // Calculate weighted average based on estimates
    // If a task has estimatedPoints, use that as weight
    // Otherwise, if it has estimatedHours, use that as weight
    // Otherwise, treat all tasks equally (weight = 1)
    let totalWeightedProgress = 0;
    let totalWeight = 0;

    for (const task of taskResults) {
      const progress = task.progress || 0;
      const weight = task.estimatedPoints || task.estimatedHours || 1;

      totalWeightedProgress += progress * weight;
      totalWeight += weight;
    }

    // Calculate weighted average
    const weightedAverage =
      totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0;

    return weightedAverage;
  }
}

// Export singleton instance
export const projectService = new ProjectService();
