import {
  db,
  eq,
  projects,
  subtasks,
  tasks,
  users,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { subtaskRoutes } from "./subtasks";

// Create a test app with auth middleware and subtask routes
const createTestApp = (authenticated = false, userId: string | null = null) => {
  const app = new Elysia()
    .decorate("authenticated", authenticated)
    .decorate("userId", userId)
    .decorate("sessionId", null as string | null)
    .decorate("accessToken", null as string | null)
    .use(subtaskRoutes);

  return app;
};

describe("Subtask Routes", () => {
  let testUserId: string;
  let testTaskWorkflowId: string;
  let testSubtaskWorkflowId: string;
  let testProjectId: string;
  let testTaskStatusId: string;
  let testSubtaskStatusId: string;
  let testTaskId: string;
  let testSubtaskId: string | undefined;

  beforeAll(async () => {
    // Create a test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `test-subtasks-${Date.now()}@example.com`,
        name: "Test User",
        bio: "Test bio",
        passwordHash: "dummy-hash",
      })
      .returning();
    testUserId = userResult[0].id;

    // Create a test task workflow
    const taskWorkflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Task Workflow",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testTaskWorkflowId = taskWorkflowResult[0].id;

    // Create a test subtask workflow
    const subtaskWorkflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Subtask Workflow",
        workflowType: "subtask",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testSubtaskWorkflowId = subtaskWorkflowResult[0].id;

    // Create a task workflow status
    const taskStatusResult = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId: testTaskWorkflowId,
        name: "To Do",
        phase: "backlog",
        colorCode: "#808080",
        position: 1,
      })
      .returning();
    testTaskStatusId = taskStatusResult[0].id;

    // Create a subtask workflow status
    const subtaskStatusResult = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId: testSubtaskWorkflowId,
        name: "To Do",
        phase: "backlog",
        colorCode: "#808080",
        position: 1,
      })
      .returning();
    testSubtaskStatusId = subtaskStatusResult[0].id;

    // Create a test project
    const projectResult = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: "Test Project",
        ownerId: testUserId,
        workflowId: testTaskWorkflowId,
        status: "active",
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();
    testProjectId = projectResult[0].id;

    // Create a test task
    const taskResult = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        projectId: testProjectId,
        title: "Test Task",
        statusId: testTaskStatusId,
        priority: "medium",
        progress: 0,
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();
    testTaskId = taskResult[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testSubtaskId) {
      await db.delete(subtasks).where(eq(subtasks.id, testSubtaskId));
    }
    if (testTaskId) {
      await db.delete(tasks).where(eq(tasks.id, testTaskId));
    }
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
    if (testSubtaskStatusId) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.id, testSubtaskStatusId));
    }
    if (testTaskStatusId) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.id, testTaskStatusId));
    }
    if (testSubtaskWorkflowId) {
      await db.delete(workflows).where(eq(workflows.id, testSubtaskWorkflowId));
    }
    if (testTaskWorkflowId) {
      await db.delete(workflows).where(eq(workflows.id, testTaskWorkflowId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe("POST /subtasks", () => {
    it("should create a new subtask", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request("http://localhost/subtasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: testTaskId,
            title: "Test Subtask",
            description: "Test subtask description",
            priority: "high",
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subtask).toBeDefined();
      expect(data.subtask.title).toBe("Test Subtask");
      expect(data.subtask.taskId).toBe(testTaskId);
      expect(data.subtask.priority).toBe("high");

      testSubtaskId = data.subtask.id;
    });

    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/subtasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: testTaskId,
            title: "Test Subtask",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /subtasks/:id", () => {
    it("should get subtask details", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subtask).toBeDefined();
      expect(data.subtask.id).toBe(testSubtaskId);
      expect(data.subtask.title).toBe("Test Subtask");
    });

    it("should return 404 for non-existent subtask", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${crypto.randomUUID()}`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /subtasks/:id", () => {
    it("should update subtask details", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Updated Subtask Title",
            priority: "critical",
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subtask.title).toBe("Updated Subtask Title");
      expect(data.subtask.priority).toBe("critical");
    });
  });

  describe("PATCH /subtasks/:id/status", () => {
    it("should update subtask status", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statusId: testSubtaskStatusId,
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subtask.statusId).toBe(testSubtaskStatusId);
    });
  });

  describe("POST /subtasks/:id/assign", () => {
    it("should assign subtask to a user", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assigneeId: testUserId,
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Subtask assigned successfully");
    });
  });

  describe("DELETE /subtasks/:id/assign", () => {
    it("should unassign subtask", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}/assign`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Subtask unassigned successfully");
    });
  });

  describe("DELETE /subtasks/:id", () => {
    it("should delete a subtask", async () => {
      const app = createTestApp(true, testUserId);

      const response = await app.handle(
        new Request(`http://localhost/subtasks/${testSubtaskId}`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Subtask deleted successfully");

      // Clear testSubtaskId since it's been deleted
      testSubtaskId = undefined;
    });
  });
});
