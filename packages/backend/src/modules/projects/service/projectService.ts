import {
  NewProject,
  NewTask,
  NewTaskComment,
  NewTaskHistory,
  NewTaskRelation,
  NewWorkflow,
  NewWorkflowStatus,
  projectsTable,
  Task,
  taskCommentsTable,
  taskRelationsTable,
  tasksTable,
  Workflow,
  workflowsTable,
  workflowStatusTable,
} from "@wingmnn/db";
import { isEmpty, tryCatchAsync } from "@wingmnn/utils";
import { eq } from "drizzle-orm";
import {
  projectsQuery,
  taskCommentsQuery,
  taskHistoryQuery,
  taskRelationsQuery,
  tasksQuery,
  workflowsQuery,
  workflowStatusesQuery,
} from "../utils";

export class ProjectService {
  // ========== PROJECT METHODS ==========

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

    // Create default workflow for the project
    await this.createDefaultWorkflow(data.createdBy);

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

  // ========== WORKFLOW METHODS ==========

  async createDefaultWorkflow(createdBy: string): Promise<Workflow> {
    const workflowData: Omit<NewWorkflow, "id" | "createdAt" | "updatedAt"> = {
      name: "Default Workflow",
      description: "Default project workflow",
      isDefault: true,
      createdBy,
      updatedBy: createdBy,
      deleted: false,
    };

    const { result: workflow, error: workflowError } = await tryCatchAsync(
      workflowsQuery.insert.values(workflowData).returning(),
    );

    if (workflowError)
      throw new Error(`Failed to create workflow: ${workflowError.message}`);

    const workflowId = workflow[0].id;

    // Create default statuses
    const defaultStatuses = [
      { name: "To Do", type: "todo" as const, order: 1, isInitial: true },
      { name: "In Progress", type: "in_progress" as const, order: 2 },
      { name: "Review", type: "review" as const, order: 3 },
      { name: "Testing", type: "testing" as const, order: 4 },
      { name: "Done", type: "done" as const, order: 5, isFinal: true },
    ];

    for (const status of defaultStatuses) {
      await this.createWorkflowStatus({
        ...status,
        workflowId,
        createdBy,
        updatedBy: createdBy,
        deleted: false,
      });
    }

    return workflow[0];
  }

  async createWorkflow(
    data: Omit<NewWorkflow, "id" | "createdAt" | "updatedAt">,
  ) {
    const { result, error } = await tryCatchAsync(
      workflowsQuery.insert
        .values({
          ...data,
          updatedBy: data.createdBy,
        })
        .returning(),
    );

    if (error) throw new Error(`Failed to create workflow: ${error.message}`);

    return result[0];
  }

  async getWorkflow(workflowId: string) {
    const { result, error } = await tryCatchAsync(
      workflowsQuery.get("id", workflowId),
    );

    if (error) throw new Error(`Failed to get workflow: ${error.message}`);
    if (!result) throw new Error("Workflow not found");

    return result;
  }

  async updateWorkflow(
    workflowId: string,
    data: Partial<NewWorkflow>,
    updatedBy: string,
  ) {
    const { result, error } = await tryCatchAsync(
      workflowsQuery.update
        .set({
          ...data,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(workflowsTable.id, workflowId))
        .returning(),
    );

    if (error) throw new Error(`Failed to update workflow: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Workflow not found");

    return result[0];
  }

  async deleteWorkflow(workflowId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      workflowsQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(workflowsTable.id, workflowId))
        .returning(),
    );

    if (error) throw new Error(`Failed to delete workflow: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Workflow not found");

    return { success: true, message: "Workflow deleted successfully" };
  }

  // ========== WORKFLOW STATUS METHODS ==========

  async createWorkflowStatus(
    data: Omit<NewWorkflowStatus, "id" | "createdAt" | "updatedAt">,
  ) {
    const { result, error } = await tryCatchAsync(
      workflowStatusesQuery.insert
        .values({
          ...data,
          updatedBy: data.createdBy,
        })
        .returning(),
    );

    if (error)
      throw new Error(`Failed to create workflow status: ${error.message}`);

    return result[0];
  }

  async getWorkflowStatus(statusId: string) {
    const { result, error } = await tryCatchAsync(
      workflowStatusesQuery.get("id", statusId),
    );

    if (error)
      throw new Error(`Failed to get workflow status: ${error.message}`);
    if (!result) throw new Error("Workflow status not found");

    return result;
  }

  async updateWorkflowStatus(
    statusId: string,
    data: Partial<NewWorkflowStatus>,
    updatedBy: string,
  ) {
    const { result, error } = await tryCatchAsync(
      workflowStatusesQuery.update
        .set({
          ...data,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(workflowStatusTable.id, statusId))
        .returning(),
    );

    if (error)
      throw new Error(`Failed to update workflow status: ${error.message}`);
    if (!result || result.length === 0)
      throw new Error("Workflow status not found");

    return result[0];
  }

  async deleteWorkflowStatus(statusId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      workflowStatusesQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(workflowStatusTable.id, statusId))
        .returning(),
    );

    if (error)
      throw new Error(`Failed to delete workflow status: ${error.message}`);
    if (!result || result.length === 0)
      throw new Error("Workflow status not found");

    return { success: true, message: "Workflow status deleted successfully" };
  }

  async getStatusesByWorkflow(workflowId: string) {
    const { result, error } = await tryCatchAsync(
      workflowStatusesQuery.getByWorkflow(workflowId),
    );

    if (error)
      throw new Error(`Failed to get workflow statuses: ${error.message}`);

    return result || [];
  }

  // ========== TASK METHODS ==========

  async createTask(
    data: Omit<NewTask, "id" | "createdAt" | "updatedAt" | "key">,
  ) {
    if (!data.title || !data.projectId) {
      throw new Error("Task title and project ID are required");
    }

    // Generate task key
    const taskKey = await this.generateTaskKey(data.projectId);

    const taskData = {
      ...data,
      key: taskKey,
      updatedBy: data.createdBy,
      reporterId: data.createdBy,
    };

    const promise = tasksQuery.insert.values(taskData).returning();

    const { result, error } = await tryCatchAsync(promise);

    if (error) throw new Error(`Failed to create task: ${error.message}`);

    if (!result) {
      throw new Error("Failed to create task");
    }

    const task = result[0];

    // Log task creation in history
    await this.logTaskHistory({
      taskId: task.id,
      field: "created",
      newValue: "Task created",
      type: "created",
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      deleted: false,
    });

    return task;
  }

  async getTask(taskId: string) {
    const { result, error } = await tryCatchAsync(tasksQuery.get("id", taskId));

    if (error) throw new Error(`Failed to get task: ${error.message}`);
    if (!result) throw new Error("Task not found");

    return result;
  }

  async getTaskWithRelations(taskId: string) {
    const { result, error } = await tryCatchAsync(
      tasksQuery.getWithRelations(taskId),
    );

    if (error)
      throw new Error(`Failed to get task with relations: ${error.message}`);
    if (!result) throw new Error("Task not found");

    return result;
  }

  async updateTask(taskId: string, data: Partial<NewTask>, updatedBy: string) {
    if (isEmpty(data)) {
      throw new Error("No data provided for update");
    }

    // Get current task to log changes
    const currentTask = await this.getTask(taskId);

    const { result, error } = await tryCatchAsync(
      tasksQuery.update
        .set({
          ...data,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(tasksTable.id, taskId))
        .returning(),
    );

    if (error) throw new Error(`Failed to update task: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Task not found");

    // Log changes in history
    for (const [field, newValue] of Object.entries(data)) {
      const oldValue = currentTask[field as keyof Task];
      if (oldValue !== newValue) {
        await this.logTaskHistory({
          taskId,
          field,
          oldValue: String(oldValue),
          newValue: String(newValue),
          type: "updated",
          createdBy: updatedBy,
          updatedBy,
          deleted: false,
        });
      }
    }

    return result[0];
  }

  async deleteTask(taskId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      tasksQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(tasksTable.id, taskId))
        .returning(),
    );

    if (error) throw new Error(`Failed to delete task: ${error.message}`);
    if (!result || result.length === 0) throw new Error("Task not found");

    // Log task deletion
    await this.logTaskHistory({
      taskId,
      field: "deleted",
      newValue: "true",
      type: "deleted",
      createdBy: deletedBy,
      updatedBy: deletedBy,
      deleted: false,
    });

    return { success: true, message: "Task deleted successfully" };
  }

  async getTasksPaginated(filters: {
    projectId?: string;
    status?: string;
    assignee?: string;
    priority?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    if (filters.projectId) {
      const { result, error } = await tryCatchAsync(
        tasksQuery.getTasksByProject(filters.projectId, filters),
      );

      if (error) throw new Error(`Failed to get tasks: ${error.message}`);
      return result || [];
    } else {
      const { result, error } = await tryCatchAsync(tasksQuery.search(filters));

      if (error) throw new Error(`Failed to search tasks: ${error.message}`);
      return result || [];
    }
  }

  async getSubtasks(parentTaskId: string) {
    const { result, error } = await tryCatchAsync(
      tasksQuery.getSubtasks(parentTaskId),
    );

    if (error) throw new Error(`Failed to get subtasks: ${error.message}`);

    return result || [];
  }

  async assignTask(taskId: string, assigneeId: string, assignedBy: string) {
    return this.updateTask(taskId, { assignedTo: assigneeId }, assignedBy);
  }

  async updateTaskStatus(taskId: string, statusId: string, updatedBy: string) {
    return this.updateTask(taskId, { status: statusId }, updatedBy);
  }

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

  // ========== TASK COMMENTS METHODS ==========

  async addTaskComment(
    data: Omit<NewTaskComment, "id" | "createdAt" | "updatedAt">,
  ) {
    const { result, error } = await tryCatchAsync(
      taskCommentsQuery.insert
        .values({
          ...data,
          updatedBy: data.createdBy,
        })
        .returning(),
    );

    if (error) throw new Error(`Failed to add task comment: ${error.message}`);

    return result[0];
  }

  async updateTaskComment(
    commentId: string,
    content: string,
    updatedBy: string,
  ) {
    const { result, error } = await tryCatchAsync(
      taskCommentsQuery.update
        .set({
          content,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(taskCommentsTable.id, commentId))
        .returning(),
    );

    if (error)
      throw new Error(`Failed to update task comment: ${error.message}`);

    return result[0];
  }

  async deleteTaskComment(commentId: string, deletedBy: string) {
    const { result, error } = await tryCatchAsync(
      taskCommentsQuery.update
        .set({
          deleted: true,
          updatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(taskCommentsTable.id, commentId))
        .returning(),
    );

    if (error)
      throw new Error(`Failed to delete task comment: ${error.message}`);

    return { success: true, message: "Task comment deleted successfully" };
  }

  // ========== UTILITY METHODS ==========

  private async generateTaskKey(projectId: string): Promise<string> {
    // Get project to create key prefix
    const project = await this.get(projectId);
    const prefix = project.name.substring(0, 3).toUpperCase();

    // Get count of tasks in project to generate sequential number
    const tasks = await this.getTasksPaginated({ projectId, limit: 1000 });
    const taskNumber = tasks.length + 1;

    return `${prefix}-${taskNumber}`;
  }

  private async logTaskHistory(
    data: Omit<NewTaskHistory, "id" | "createdAt" | "updatedAt">,
  ) {
    await taskHistoryQuery.insert.values({
      ...data,
      updatedBy: data.createdBy,
    });
  }

  // ========== ACTIONS METHODS ==========

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

      case "delete_task":
        return this.deleteTask(targetId, userId);

      case "assign_task":
        if (!additionalData?.assigneeId) {
          throw new Error("Assignee ID is required for task assignment");
        }
        return this.assignTask(targetId, additionalData.assigneeId, userId);

      case "update_task_status":
        if (!additionalData?.statusId) {
          throw new Error("Status ID is required for status update");
        }
        return this.updateTaskStatus(targetId, additionalData.statusId, userId);

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }
}
