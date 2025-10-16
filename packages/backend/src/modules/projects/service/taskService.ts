import {
  taskCommentsQuery,
  taskHistoryQuery,
  tasksQuery,
} from "@projects/utils";
import {
  eq,
  NewTask,
  NewTaskComment,
  NewTaskHistory,
  Task,
  taskCommentsTable,
  tasksTable,
} from "@wingmnn/db";
import { isEmpty, tryCatchAsync } from "@wingmnn/utils";
import { projectService } from "./projectService";

class TaskService {
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

  // task comments
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

  // actions
  async actions(
    actionType: string,
    targetId: string,
    userId: string,
    additionalData?: any,
  ) {
    switch (actionType) {
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

  // utils
  private async generateTaskKey(projectId: string): Promise<string> {
    // Get project to create key prefix
    const project = await projectService.get(projectId);
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
}

export const taskService = new TaskService();
