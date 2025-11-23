import { db, eq, users, workflows, workflowStatuses } from "@wingmnn/db";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { workflowService } from "../services/workflow.service";

describe("Workflow Routes Integration", () => {
  let testUserId: string;
  let testWorkflowId: string;

  beforeAll(async () => {
    // Create a test user
    const testUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `test-workflow-${Date.now()}@example.com`,
        name: "Test Workflow User",
        bio: "",
        passwordHash: "test-hash",
      })
      .returning();

    testUserId = testUser[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testWorkflowId) {
      // Delete statuses first (cascade should handle this, but being explicit)
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.workflowId, testWorkflowId));
      await db.delete(workflows).where(eq(workflows.id, testWorkflowId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should create a workflow via service", async () => {
    const workflow = await workflowService.createWorkflow(
      {
        name: "Test Workflow",
        description: "Test workflow for routes",
        workflowType: "task",
        isTemplate: false,
      },
      testUserId
    );

    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Test Workflow");
    expect(workflow.workflowType).toBe("task");
    expect(workflow.createdBy).toBe(testUserId);

    testWorkflowId = workflow.id;
  });

  it("should add a status to workflow via service", async () => {
    if (!testWorkflowId) {
      throw new Error("Test workflow not created");
    }

    const status = await workflowService.addStatus(
      testWorkflowId,
      {
        name: "To Do",
        description: "Tasks to be done",
        phase: "backlog",
        colorCode: "#808080",
      },
      testUserId
    );

    expect(status).toBeDefined();
    expect(status.name).toBe("To Do");
    expect(status.phase).toBe("backlog");
    expect(status.workflowId).toBe(testWorkflowId);
  });

  it("should get workflow with statuses via service", async () => {
    if (!testWorkflowId) {
      throw new Error("Test workflow not created");
    }

    const workflow = await workflowService.getWorkflow(testWorkflowId);

    expect(workflow).toBeDefined();
    expect(workflow?.statuses).toBeDefined();
    expect(workflow?.statuses?.length).toBeGreaterThan(0);
  });

  it("should list workflows via service", async () => {
    const workflows = await workflowService.listWorkflows(testUserId);

    expect(workflows).toBeDefined();
    expect(Array.isArray(workflows)).toBe(true);
    expect(workflows.length).toBeGreaterThan(0);
  });
});
