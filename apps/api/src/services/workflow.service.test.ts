import { db, eq, users, workflows } from "@wingmnn/db";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import "../test-setup";
import { WorkflowError, workflowService } from "./workflow.service";

describe("WorkflowService", () => {
  let testUserId: string;

  // Create a test user before all tests
  beforeAll(async () => {
    // Create test user
    const result = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "workflow-test@example.com",
        name: "Workflow Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = result[0].id;
  });

  // Clean up test user after all tests
  afterAll(async () => {
    try {
      // Clean up in reverse order of dependencies
      if (testUserId) {
        await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
        await db.delete(users).where(eq(users.id, testUserId));
      }
    } catch (error) {
      console.error("Cleanup error in workflow.service.test:", error);
    }
  });

  // Helper to clean up test data
  async function cleanupWorkflows() {
    await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
  }

  beforeEach(async () => {
    await cleanupWorkflows();
  });

  describe("createWorkflow", () => {
    test("creates a workflow with required fields", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          description: "Test Description",
          workflowType: "task",
        },
        testUserId
      );

      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe("Test Workflow");
      expect(workflow.description).toBe("Test Description");
      expect(workflow.workflowType).toBe("task");
      expect(workflow.createdBy).toBe(testUserId);
      expect(workflow.isTemplate).toBe(false);
    });

    test("creates a template workflow", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Template Workflow",
          workflowType: "subtask",
          isTemplate: true,
        },
        testUserId
      );

      expect(workflow.isTemplate).toBe(true);
    });
  });

  describe("getWorkflow", () => {
    test("returns workflow with statuses", async () => {
      const created = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.addStatus(
        created.id,
        {
          name: "Backlog",
          phase: "backlog",
        },
        testUserId
      );

      const workflow = await workflowService.getWorkflow(created.id);

      expect(workflow).toBeDefined();
      expect(workflow?.statuses).toBeDefined();
      expect(workflow?.statuses?.length).toBe(1);
      expect(workflow?.statuses?.[0].name).toBe("Backlog");
    });

    test("returns null for non-existent workflow", async () => {
      const workflow = await workflowService.getWorkflow("non-existent-id");
      expect(workflow).toBeNull();
    });
  });

  describe("addStatus", () => {
    test("adds status with all required fields", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      const status = await workflowService.addStatus(
        workflow.id,
        {
          name: "In Progress",
          description: "Work in progress",
          phase: "in_progress",
          colorCode: "#FF0000",
        },
        testUserId
      );

      expect(status.id).toBeDefined();
      expect(status.name).toBe("In Progress");
      expect(status.description).toBe("Work in progress");
      expect(status.phase).toBe("in_progress");
      expect(status.colorCode).toBe("#FF0000");
      expect(status.position).toBe(0);
    });

    test("auto-increments position", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      const status1 = await workflowService.addStatus(
        workflow.id,
        { name: "Status 1", phase: "backlog" },
        testUserId
      );

      const status2 = await workflowService.addStatus(
        workflow.id,
        { name: "Status 2", phase: "closed" },
        testUserId
      );

      expect(status1.position).toBe(0);
      expect(status2.position).toBe(1);
    });

    test("throws error for non-existent workflow", async () => {
      await expect(
        workflowService.addStatus(
          "non-existent-id",
          { name: "Status", phase: "backlog" },
          testUserId
        )
      ).rejects.toThrow(WorkflowError);
    });
  });

  describe("validateWorkflowPhases", () => {
    test("validates workflow with required phases", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.addStatus(
        workflow.id,
        { name: "Backlog", phase: "backlog" },
        testUserId
      );

      await workflowService.addStatus(
        workflow.id,
        { name: "Done", phase: "closed" },
        testUserId
      );

      const isValid = await workflowService.validateWorkflowPhases(workflow.id);
      expect(isValid).toBe(true);
    });

    test("throws error for workflow missing backlog phase", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.addStatus(
        workflow.id,
        { name: "Done", phase: "closed" },
        testUserId
      );

      await expect(
        workflowService.validateWorkflowPhases(workflow.id)
      ).rejects.toThrow(WorkflowError);
    });

    test("throws error for workflow missing closed phase", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.addStatus(
        workflow.id,
        { name: "Backlog", phase: "backlog" },
        testUserId
      );

      await expect(
        workflowService.validateWorkflowPhases(workflow.id)
      ).rejects.toThrow(WorkflowError);
    });
  });

  describe("listWorkflows", () => {
    test("returns user's workflows and templates", async () => {
      await workflowService.createWorkflow(
        {
          name: "User Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.createWorkflow(
        {
          name: "Template Workflow",
          workflowType: "task",
          isTemplate: true,
        },
        testUserId
      );

      const workflows = await workflowService.listWorkflows(testUserId);
      expect(workflows.length).toBeGreaterThanOrEqual(2);
    });

    test("filters by workflow type", async () => {
      await workflowService.createWorkflow(
        {
          name: "Task Workflow",
          workflowType: "task",
        },
        testUserId
      );

      await workflowService.createWorkflow(
        {
          name: "Subtask Workflow",
          workflowType: "subtask",
        },
        testUserId
      );

      const taskWorkflows = await workflowService.listWorkflows(
        testUserId,
        "task"
      );
      const subtaskWorkflows = await workflowService.listWorkflows(
        testUserId,
        "subtask"
      );

      expect(taskWorkflows.every((w) => w.workflowType === "task")).toBe(true);
      expect(subtaskWorkflows.every((w) => w.workflowType === "subtask")).toBe(
        true
      );
    });
  });

  describe("updateStatus", () => {
    test("updates status properties", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      const status = await workflowService.addStatus(
        workflow.id,
        { name: "Original", phase: "backlog" },
        testUserId
      );

      const updated = await workflowService.updateStatus(
        status.id,
        {
          name: "Updated",
          colorCode: "#00FF00",
        },
        testUserId
      );

      expect(updated.name).toBe("Updated");
      expect(updated.colorCode).toBe("#00FF00");
      expect(updated.phase).toBe("backlog"); // Unchanged
    });
  });

  describe("reorderStatuses", () => {
    test("reorders statuses correctly", async () => {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );

      const status1 = await workflowService.addStatus(
        workflow.id,
        { name: "Status 1", phase: "backlog" },
        testUserId
      );

      const status2 = await workflowService.addStatus(
        workflow.id,
        { name: "Status 2", phase: "closed" },
        testUserId
      );

      const status3 = await workflowService.addStatus(
        workflow.id,
        { name: "Status 3", phase: "in_progress" },
        testUserId
      );

      // Reorder: status3, status1, status2
      await workflowService.reorderStatuses(
        workflow.id,
        [status3.id, status1.id, status2.id],
        testUserId
      );

      const updated = await workflowService.getWorkflow(workflow.id);
      expect(updated?.statuses?.[0].id).toBe(status3.id);
      expect(updated?.statuses?.[1].id).toBe(status1.id);
      expect(updated?.statuses?.[2].id).toBe(status2.id);
    });
  });
});
