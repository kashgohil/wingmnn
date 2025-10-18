import {
  NewProject,
  NewTaskRelation,
  projectsTable,
  taskRelationsTable,
} from "@wingmnn/db";
import { isEmpty, tryCatchAsync } from "@wingmnn/utils";
import { desc, eq } from "drizzle-orm";
import { projectsQuery, taskRelationsQuery } from "../utils";

export class ProjectService {
  async getAll(userId: string) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.findMany({
        where: eq(projectsTable.createdBy, userId),
        orderBy: desc(projectsTable.updatedAt),
      }),
    );

    if (error) throw new Error(`Failed to get projects: ${error.message}`);

    return result;
  }

  async get(projectId: string) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.get("id", projectId),
    );

    if (error) throw new Error(`Failed to get project: ${error.message}`);
    if (!result) throw new Error("Project not found");

    return result;
  }

  async getWithTasks(projectId: string) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.getWithTasks(projectId),
    );

    if (error)
      throw new Error(`Failed to get project with tasks: ${error.message}`);
    if (!result) throw new Error("Project not found");

    return result;
  }

  async create(data: Omit<NewProject, "id" | "createdAt" | "updatedAt">) {
    if (!data.name || !data.createdBy) {
      throw new Error("Project name and creator are required");
    }

    const { result, error } = await tryCatchAsync(
      projectsQuery.insert
        .values({
          ...data,
          updatedBy: data.createdBy,
        })
        .returning(),
    );

    if (error) throw new Error(`Failed to create project: ${error.message}`);

    const project = result[0];

    return project;
  }

  async update(
    projectId: string,
    data: Partial<NewProject>,
    updatedBy: string,
  ) {
    if (isEmpty(data)) {
      throw new Error("No data provided for update");
    }

    const { result, error } = await tryCatchAsync(
      projectsQuery.update
        .set({
          ...data,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(projectsTable.id, projectId))
        .returning(),
    );

    if (error) throw new Error(`Failed to update project: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Project not found");

    return result[0];
  }

  async delete(projectId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(projectsTable.id, projectId))
        .returning(),
    );

    if (error) throw new Error(`Failed to delete project: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Project not found");

    return { success: true, message: "Project deleted successfully" };
  }

  async search(filters: {
    search?: string;
    status?: string;
    priority?: number;
    createdBy?: string;
    projectLead?: string;
    tags?: string[];
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.search(filters),
    );

    if (error) throw new Error(`Failed to search projects: ${error.message}`);

    return result || [];
  }

  async getStats(projectId: string) {
    const { result, error } = await tryCatchAsync(
      projectsQuery.getStats(projectId),
    );

    if (error) throw new Error(`Failed to get project stats: ${error.message}`);

    return result;
  }

  async archive(projectId: string, archivedBy: string) {
    return this.update(projectId, { status: "archived" }, archivedBy);
  }

  async unarchive(projectId: string, unarchivedBy: string) {
    return this.update(projectId, { status: "active" }, unarchivedBy);
  }

  // ========== WORKFLOW STATUS METHODS ==========

  // ========== TASK METHODS ==========

  // ========== TASK RELATIONS METHODS ==========

  async createTaskRelation(
    data: Omit<NewTaskRelation, "id" | "createdAt" | "updatedAt">,
  ) {
    const { result, error } = await tryCatchAsync(
      taskRelationsQuery.insert
        .values({
          ...data,
          updatedBy: data.createdBy,
        })
        .returning(),
    );

    if (error)
      throw new Error(`Failed to create task relation: ${error.message}`);

    return result[0];
  }

  async deleteTaskRelation(relationId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      taskRelationsQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(taskRelationsTable.id, relationId))
        .returning(),
    );

    if (error)
      throw new Error(`Failed to delete task relation: ${error.message}`);

    return { success: true, message: "Task relation deleted successfully" };
  }

  // actions
  async actions(
    actionType: string,
    targetId: string,
    userId: string,
    additionalData?: any,
  ) {
    switch (actionType) {
      case "delete_project":
        return this.delete(targetId, userId);
      case "archive_project":
        return this.archive(targetId, userId);
      case "unarchive_project":
        return this.unarchive(targetId, userId);
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }
}

export const projectService = new ProjectService();
