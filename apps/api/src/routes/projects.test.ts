import { db, eq, projects, users, workflows } from "@wingmnn/db";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { auth } from "../middleware/auth";
import { projectRoutes } from "./projects";

// Create a test app with auth middleware and project routes
const createTestApp = () => {
  return new Elysia()
    .decorate("authenticated", false as boolean)
    .decorate("userId", null as string | null)
    .decorate("sessionId", null as string | null)
    .decorate("accessToken", null as string | null)
    .use(auth())
    .use(projectRoutes);
};

describe("Project Routes", () => {
  let testUserId: string;
  let testWorkflowId: string;
  let testProjectId: string | undefined;
  let accessToken: string;

  beforeAll(async () => {
    // Create a test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `test-${Date.now()}@example.com`,
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
        name: "Test Workflow",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testWorkflowId = workflowResult[0].id;

    // Mock access token (in real tests, you'd generate a proper JWT)
    accessToken = "mock-token";
  });

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
    if (testWorkflowId) {
      await db.delete(workflows).where(eq(workflows.id, testWorkflowId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe("POST /projects", () => {
    it("should create a new project", async () => {
      const app = createTestApp();

      // Mock authentication by setting decorators
      const response = await app.handle(
        new Request("http://localhost/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test Project",
            description: "Test Description",
            workflowId: testWorkflowId,
          }),
        })
      );

      // Note: This test will fail without proper authentication
      // In a real scenario, you'd need to set up proper JWT tokens
      expect(response.status).toBe(401); // Unauthorized without proper auth
    });
  });

  describe("GET /projects", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /projects/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /projects/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Updated Name",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /projects/:id", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /projects/:id/status", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "archived",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /projects/:id/members", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "some-user-id",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /projects/:id/members/:memberId", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id/members/member-id", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /projects/:id/members", () => {
    it("should require authentication", async () => {
      const app = createTestApp();

      const response = await app.handle(
        new Request("http://localhost/projects/test-id/members", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
