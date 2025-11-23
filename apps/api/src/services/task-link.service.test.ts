import {
  db,
  eq,
  projects,
  taskLinks,
  tasks,
  users,
  workflows,
} from "@wingmnn/db";
import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { projectService } from "./project.service";
import {
  TaskLinkError,
  TaskLinkErrorCode,
  taskLinkService,
  type TaskLinkType,
} from "./task-link.service";
import { taskService } from "./task.service";
import { workflowService } from "./workflow.service";

describe("TaskLinkService", () => {
  let testUserId: string;
  let testUser2Id: string;
  let testProjectId: string;
  let testWorkflowId: string;
  let testTaskId1: string;
  let testTaskId2: string;

  beforeEach(async () => {
    // Clean up test data in correct order (respecting foreign keys)
    await db.delete(taskLinks);
    await db.delete(tasks);
    await db.delete(projects);

    // Create test users if they don't exist
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "tasklink@test.com"))
      .limit(1);

    if (existingUser.length === 0) {
      const userResult = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Task Link Test User",
          bio: "Test user for task link tests",
          email: "tasklink@test.com",
          passwordHash: "hash",
        })
        .returning();
      testUserId = userResult[0].id;
    } else {
      testUserId = existingUser[0].id;
    }

    const existingUser2 = await db
      .select()
      .from(users)
      .where(eq(users.email, "tasklink2@test.com"))
      .limit(1);

    if (existingUser2.length === 0) {
      const user2Result = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Task Link Test User 2",
          bio: "Second test user for task link tests",
          email: "tasklink2@test.com",
          passwordHash: "hash",
        })
        .returning();
      testUser2Id = user2Result[0].id;
    } else {
      testUser2Id = existingUser2[0].id;
    }

    // Create test workflow with statuses
    const workflow = await workflowService.createWorkflow(
      {
        name: "Test Workflow",
        workflowType: "task",
      },
      testUserId
    );
    testWorkflowId = workflow.id;

    // Add statuses to workflow
    await workflowService.addStatus(
      testWorkflowId,
      {
        name: "Backlog",
        phase: "backlog",
        colorCode: "#gray",
        position: 0,
      },
      testUserId
    );

    await workflowService.addStatus(
      testWorkflowId,
      {
        name: "Done",
        phase: "closed",
        colorCode: "#green",
        position: 1,
      },
      testUserId
    );

    // Create test project
    const project = await projectService.createProject(
      {
        name: "Test Project",
        workflowId: testWorkflowId,
      },
      testUserId
    );
    testProjectId = project.id;

    // Create test tasks
    const task1 = await taskService.createTask(
      {
        projectId: testProjectId,
        title: "Test Task 1",
      },
      testUserId
    );
    testTaskId1 = task1.id;

    const task2 = await taskService.createTask(
      {
        projectId: testProjectId,
        title: "Test Task 2",
      },
      testUserId
    );
    testTaskId2 = task2.id;
  });

  afterAll(async () => {
    try {
      // Clean up in reverse order of dependencies
      await db.delete(taskLinks);
      await db.delete(tasks);
      await db.delete(projects);

      // Delete workflows before users since workflows reference users
      if (testUserId) {
        await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
        await db.delete(users).where(eq(users.id, testUserId));
      }
      if (testUser2Id) {
        await db.delete(users).where(eq(users.id, testUser2Id));
      }
    } catch (error) {
      console.error("Cleanup error in task-link.service.test:", error);
    }
  });

  describe("createLink", () => {
    test("should create a task link with valid inputs", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "relates_to",
        testUserId
      );

      const links = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      expect(links.length).toBe(1);
      expect(links[0].targetTaskId).toBe(testTaskId2);
      expect(links[0].linkType).toBe("relates_to");
      expect(links[0].createdBy).toBe(testUserId);
    });

    test("should create inverse link for directional link types", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "blocks",
        testUserId
      );

      // Check primary link
      const primaryLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      expect(primaryLinks.length).toBe(1);
      expect(primaryLinks[0].linkType).toBe("blocks");

      // Check inverse link
      const inverseLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId2));

      expect(inverseLinks.length).toBe(1);
      expect(inverseLinks[0].linkType).toBe("blocked_by");
      expect(inverseLinks[0].targetTaskId).toBe(testTaskId1);
    });

    test("should create inverse link for depends_on", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "depends_on",
        testUserId
      );

      const inverseLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId2));

      expect(inverseLinks.length).toBe(1);
      expect(inverseLinks[0].linkType).toBe("dependency_of");
    });

    test("should create inverse link for duplicates", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "duplicates",
        testUserId
      );

      const inverseLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId2));

      expect(inverseLinks.length).toBe(1);
      expect(inverseLinks[0].linkType).toBe("duplicated_by");
    });

    test("should not create inverse link for relates_to", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "relates_to",
        testUserId
      );

      const allLinks = await db.select().from(taskLinks);

      // Only one link should exist (no inverse for relates_to)
      expect(allLinks.length).toBe(1);
    });

    test("should reject linking a task to itself", async () => {
      await expect(
        taskLinkService.createLink(
          testTaskId1,
          testTaskId1,
          "blocks",
          testUserId
        )
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.createLink(
          testTaskId1,
          testTaskId1,
          "blocks",
          testUserId
        );
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.SAME_TASK_LINK
        );
      }
    });

    test("should reject invalid link type", async () => {
      await expect(
        taskLinkService.createLink(
          testTaskId1,
          testTaskId2,
          "invalid_type" as TaskLinkType,
          testUserId
        )
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.createLink(
          testTaskId1,
          testTaskId2,
          "invalid_type" as TaskLinkType,
          testUserId
        );
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.INVALID_LINK_TYPE
        );
      }
    });

    test("should reject link when source task not found", async () => {
      await expect(
        taskLinkService.createLink(
          "non-existent-id",
          testTaskId2,
          "blocks",
          testUserId
        )
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.createLink(
          "non-existent-id",
          testTaskId2,
          "blocks",
          testUserId
        );
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.TASK_NOT_FOUND
        );
      }
    });

    test("should reject link when target task not found", async () => {
      await expect(
        taskLinkService.createLink(
          testTaskId1,
          "non-existent-id",
          "blocks",
          testUserId
        )
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.createLink(
          testTaskId1,
          "non-existent-id",
          "blocks",
          testUserId
        );
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.TASK_NOT_FOUND
        );
      }
    });

    test("should reject link when user has no access to source task project", async () => {
      await expect(
        taskLinkService.createLink(
          testTaskId1,
          testTaskId2,
          "blocks",
          testUser2Id
        )
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.createLink(
          testTaskId1,
          testTaskId2,
          "blocks",
          testUser2Id
        );
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(TaskLinkErrorCode.FORBIDDEN);
      }
    });
  });

  describe("deleteLink", () => {
    test("should delete a task link", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "relates_to",
        testUserId
      );

      const links = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      expect(links.length).toBe(1);

      await taskLinkService.deleteLink(links[0].id, testUserId);

      const remainingLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      expect(remainingLinks.length).toBe(0);
    });

    test("should delete inverse link when deleting directional link", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "blocks",
        testUserId
      );

      const primaryLinks = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      expect(primaryLinks.length).toBe(1);

      await taskLinkService.deleteLink(primaryLinks[0].id, testUserId);

      // Check both links are deleted
      const allLinks = await db.select().from(taskLinks);
      expect(allLinks.length).toBe(0);
    });

    test("should reject deletion when link not found", async () => {
      await expect(
        taskLinkService.deleteLink("non-existent-id", testUserId)
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.deleteLink("non-existent-id", testUserId);
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.LINK_NOT_FOUND
        );
      }
    });

    test("should reject deletion when user has no access", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "blocks",
        testUserId
      );

      const links = await db
        .select()
        .from(taskLinks)
        .where(eq(taskLinks.sourceTaskId, testTaskId1));

      await expect(
        taskLinkService.deleteLink(links[0].id, testUser2Id)
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.deleteLink(links[0].id, testUser2Id);
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(TaskLinkErrorCode.FORBIDDEN);
      }
    });
  });

  describe("listLinks", () => {
    test("should list all links for a task", async () => {
      // Create multiple links
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "blocks",
        testUserId
      );

      const task3 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Test Task 3",
        },
        testUserId
      );

      await taskLinkService.createLink(
        testTaskId1,
        task3.id,
        "relates_to",
        testUserId
      );

      const links = await taskLinkService.listLinks(testTaskId1, testUserId);

      // Should have 2 links where task1 is source, plus 1 inverse link where task1 is target
      expect(links.length).toBe(3);
    });

    test("should return links where task is source", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "relates_to",
        testUserId
      );

      const links = await taskLinkService.listLinks(testTaskId1, testUserId);

      const sourceLinks = links.filter((l) => l.sourceTaskId === testTaskId1);
      expect(sourceLinks.length).toBeGreaterThan(0);
    });

    test("should return links where task is target", async () => {
      await taskLinkService.createLink(
        testTaskId1,
        testTaskId2,
        "blocks",
        testUserId
      );

      const links = await taskLinkService.listLinks(testTaskId2, testUserId);

      const targetLinks = links.filter((l) => l.targetTaskId === testTaskId2);
      expect(targetLinks.length).toBeGreaterThan(0);
    });

    test("should return empty array when task has no links", async () => {
      const links = await taskLinkService.listLinks(testTaskId1, testUserId);

      expect(links.length).toBe(0);
    });

    test("should reject listing when task not found", async () => {
      await expect(
        taskLinkService.listLinks("non-existent-id", testUserId)
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.listLinks("non-existent-id", testUserId);
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(
          TaskLinkErrorCode.TASK_NOT_FOUND
        );
      }
    });

    test("should reject listing when user has no access", async () => {
      await expect(
        taskLinkService.listLinks(testTaskId1, testUser2Id)
      ).rejects.toThrow(TaskLinkError);

      try {
        await taskLinkService.listLinks(testTaskId1, testUser2Id);
      } catch (error) {
        expect((error as TaskLinkError).code).toBe(TaskLinkErrorCode.FORBIDDEN);
      }
    });
  });

  describe("link type validation", () => {
    test("should accept all valid link types", async () => {
      const validTypes: TaskLinkType[] = [
        "blocks",
        "blocked_by",
        "depends_on",
        "dependency_of",
        "relates_to",
        "duplicates",
        "duplicated_by",
      ];

      for (const linkType of validTypes) {
        const task = await taskService.createTask(
          {
            projectId: testProjectId,
            title: `Task for ${linkType}`,
          },
          testUserId
        );

        // Should not throw an error
        await taskLinkService.createLink(
          testTaskId1,
          task.id,
          linkType,
          testUserId
        );

        // Verify link was created
        const links = await taskLinkService.listLinks(testTaskId1, testUserId);
        const createdLink = links.find(
          (l) => l.targetTaskId === task.id && l.linkType === linkType
        );
        expect(createdLink).toBeDefined();
      }
    });
  });
});
