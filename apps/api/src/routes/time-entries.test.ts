import {
  db,
  eq,
  projects,
  tasks,
  timeEntries,
  users,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { auth } from "../middleware/auth";
import { timeEntryRoutes } from "./time-entries";

// Create a test app with auth middleware and time entry routes
const createTestApp = () => {
  return new Elysia()
    .decorate("authenticated", false as boolean)
    .decorate("userId", null as string | null)
    .decorate("sessionId", null as string | null)
    .decorate("accessToken", null as string | null)
    .use(auth())
    .use(timeEntryRoutes);
};

describe("Time Entry Routes", () => {
  let testUserId: string;
  let testWorkflowId: string;
  let testProjectId: string;
  let testStatusId: string;
  let testTaskId: string;
  let testTimeEntryId: string | undefined;

  beforeAll(async () => {
    // Create a test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `test-time-entries-${Date.now()}@example.com`,
        name: "Test User",
        bio: "Test bio",
        passwordHash: "dummy-hash",
      })
      .returning();
    testUserId = userResult[0].id;

    // Create a test workflow
    const workflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Time Entry Workflow",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testWorkflowId = workflowResult[0].id;

    // Create a workflow status
    const statusResult = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId: testWorkflowId,
        name: "To Do",
        phase: "backlog",
        colorCode: "#808080",
        position: 1,
      })
      .returning();
    testStatusId = statusResult[0].id;

    // Create a test project
    const projectResult = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: "Test Project",
        ownerId: testUserId,
        workflowId: testWorkflowId,
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
        statusId: testStatusId,
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
    if (testTimeEntryId) {
      await db.delete(timeEntries).where(eq(timeEntries.id, testTimeEntryId));
    }
    if (testTaskId) {
      await db.delete(tasks).where(eq(tasks.id, testTaskId));
    }
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
    if (testStatusId) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.id, testStatusId));
    }
    if (testWorkflowId) {
      await db.delete(workflows).where(eq(workflows.id, testWorkflowId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should require authentication for POST", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request("http://localhost/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 120,
          date: new Date().toISOString(),
          description: "Test time entry",
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("should require authentication for GET", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request("http://localhost/time-entries", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
  });

  it("should require authentication for GET by ID", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request(`http://localhost/time-entries/test-id`, {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
  });

  it("should require authentication for PUT", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request(`http://localhost/time-entries/test-id`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          durationMinutes: 180,
          description: "Updated time entry",
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("should require authentication for summary", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request("http://localhost/time-entries/summary", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
  });

  it("should require authentication for DELETE", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request(`http://localhost/time-entries/test-id`, {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(401);
  });

  it("should validate required fields", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request("http://localhost/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing required fields
          description: "Test time entry",
        }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("should validate duration minimum", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request("http://localhost/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 0, // Invalid: must be at least 1
          date: new Date().toISOString(),
        }),
      })
    );

    expect(response.status).toBe(400);
  });
});
