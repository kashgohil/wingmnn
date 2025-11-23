import {
  db,
  eq,
  projects,
  taskLinks,
  tasks,
  users,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { auth } from "../middleware/auth";
import { taskRoutes } from "./tasks";

// Create a test app with auth middleware and task routes
const createTestApp = () => {
  return new Elysia()
    .decorate("authenticated", false as boolean)
    .decorate("userId", null as string | null)
    .decorate("sessionId", null as string | null)
    .decorate("accessToken", null as string | null)
    .use(auth())
    .use(taskRoutes);
};

describe("Task Routes", () => {
  let testUserId: string;
  let testWorkflowId: string;
  let testProjectId: string;
  let testStatusId: string;
  let testTaskId: string | undefined;
  let testTaskId2: string | undefined;
  let testLinkId: string | undefined;

  beforeAll(async () => {
    // Create a test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `test-tasks-${Date.now()}@example.com`,
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
        name: "Test Task Workflow",
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
  });

  afterAll(async () => {
    // Clean up test data
    if (testLinkId) {
      await db.delete(taskLinks).where(eq(taskLinks.id, testLinkId));
    }
    if (testTaskId) {
      await db.delete(tasks).where(eq(tasks.id, testTaskId));
    }
    if (testTaskId2) {
      await db.delete(tasks).where(eq(tasks.id, testTaskId2));
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

  describe("POST /tasks", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: testProjectId,
            title: "Test Task",
            description: "Test Description",
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should validate required fields", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Missing projectId and title
            description: "Test Description",
          }),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should validate title length", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: testProjectId,
            title: "", // Empty title
            description: "Test Description",
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /tasks", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });

    it("should accept query parameters", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request(
          "http://localhost/tasks?projectId=test&priority=high&limit=10",
          {
            method: "GET",
          }
        )
      );

      // Will fail auth but validates query params are accepted
      expect(response.status).toBe(401);
    });
  });

  describe("GET /tasks/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /tasks/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Updated Title",
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should validate title length if provided", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "", // Empty title
          }),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should validate priority values", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: "invalid", // Invalid priority
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /tasks/:id/status", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statusId: testStatusId,
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should require statusId", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("POST /tasks/:id/assign", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assigneeId: testUserId,
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should require assigneeId", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /tasks/:id/assign", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/assign", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /tasks/:id/progress", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/progress", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress: 50,
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should require progress value", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/progress", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should validate progress range (minimum)", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/progress", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress: -1, // Below minimum
          }),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should validate progress range (maximum)", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/progress", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress: 101, // Above maximum
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("POST /tasks/:id/links", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetTaskId: "target-task-id",
            linkType: "blocks",
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    it("should require targetTaskId and linkType", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should validate linkType values", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetTaskId: "target-task-id",
            linkType: "invalid_type", // Invalid link type
          }),
        })
      );

      expect(response.status).toBe(400);
    });

    it("should accept valid linkType values", async () => {
      const app = createTestApp();

      const validLinkTypes = [
        "blocks",
        "blocked_by",
        "depends_on",
        "dependency_of",
        "relates_to",
        "duplicates",
        "duplicated_by",
      ];

      for (const linkType of validLinkTypes) {
        const response = await app.handle(
          new Request("http://localhost/tasks/test-task-id/links", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              targetTaskId: "target-task-id",
              linkType,
            }),
          })
        );

        // Will fail auth but validates linkType is accepted
        expect(response.status).toBe(401);
      }
    });
  });

  describe("DELETE /tasks/:id/links/:linkId", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/links/link-id", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /tasks/:id/links", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/tasks/test-task-id/links", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
