import { workflowsQuery, workflowStatusesQuery } from "@projects/utils";
import {
  and,
  desc,
  eq,
  NewWorkflow,
  NewWorkflowStatus,
  or,
  Workflow,
  workflowsTable,
  workflowStatusTable,
} from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";

class WorkflowService {
  // Workflow
  async seedDefaultWorkflows(): Promise<void> {
    // Check if workflows already exist
    const { result: existingWorkflows } = await tryCatchAsync(
      workflowsQuery.findMany(),
    );

    if (existingWorkflows && existingWorkflows.length > 0) {
      return; // Already seeded
    }

    const systemUser = "system";

    // Seed predefined workflows
    const workflows = [
      {
        id: "basic",
        name: "Basic",
        description: "Simple workflow for basic task management",
        order: ["todo", "in-progress", "done"],
        createdBy: systemUser,
        updatedBy: systemUser,
      },
      {
        id: "kanban",
        name: "Kanban",
        description: "Traditional kanban board workflow",
        order: ["backlog", "ready", "in-progress", "review", "done"],
        createdBy: systemUser,
        updatedBy: systemUser,
      },
      {
        id: "scrum",
        name: "Scrum",
        description: "Agile scrum workflow with testing phase",
        order: ["todo", "in-progress", "review", "testing", "done"],
        createdBy: systemUser,
        updatedBy: systemUser,
      },
    ];

    for (const workflow of workflows) {
      await this.createWorkflow(workflow);
    }
  }

  async createDefaultWorkflow(createdBy: string): Promise<Workflow> {
    const workflowData: Omit<NewWorkflow, "id" | "createdAt" | "updatedAt"> = {
      name: "Default Workflow",
      description: "Default project workflow",
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

  async getWorkflows(userId: string, limit: number, offset: number) {
    const { result, error } = await tryCatchAsync(
      workflowsQuery.findMany({
        orderBy: [desc(workflowsTable.createdAt)],
        offset,
        limit,
        where: and(
          or(
            eq(workflowsTable.createdBy, userId),
            eq(workflowsTable.createdBy, "system"),
          ),
          eq(workflowsTable.deleted, false),
        ),
      }),
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

  // Workflow Status
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
}

export const workflowService = new WorkflowService();
