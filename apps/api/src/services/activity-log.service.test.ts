import {
  activityLogs,
  db,
  eq,
  projects,
  tasks,
  users,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";
import "../test-setup";
import {
  ActivityLogError,
  ActivityLogErrorCode,
  activityLogService,
  type LogActivityInput,
} from "./activity-log.service";

describe("ActivityLogService", () => {
  let testUserId: string;
  let testProjectId: string;
  let testWorkflowId: string;
  let testTaskId: string;
  let testStatusId: string;

  beforeAll(async () => {
    // Create test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `activity-test-${crypto.randomUUID()}@example.com`,
        name: "Activity Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = userResult[0].id;

    // Create test workflow
    const workflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Workflow",
        description: "Test workflow",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testWorkflowId = workflowResult[0].id;

    // Add required statuses
    const statusResults = await db
      .insert(workflowStatuses)
      .values([
        {
          id: crypto.randomUUID(),
          workflowId: testWorkflowId,
          name: "Backlog",
          phase: "backlog",
          colorCode: "#808080",
          position: 0,
        },
        {
          id: crypto.randomUUID(),
          workflowId: testWorkflowId,
          name: "Done",
          phase: "closed",
          colorCode: "#00ff00",
          position: 1,
        },
      ])
      .returning();
    testStatusId = statusResults[0].id;

    // Create test project
    const projectResult = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: "Test Project",
        description: "Test project",
        ownerId: testUserId,
        workflowId: testWorkflowId,
        status: "active",
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();
    testProjectId = projectResult[0].id;

    // Create test task
    const taskResult = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        projectId: testProjectId,
        title: "Test Task",
        description: "Test task",
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
    // Clean up in reverse order of creation
    // Delete activity logs first (they reference everything)
    await db.delete(activityLogs).where(eq(activityLogs.userId, testUserId));

    if (testTaskId) {
      await db.delete(tasks).where(eq(tasks.id, testTaskId));
    }
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

  afterEach(async () => {
    // Clean up activity logs after each test
    await db.delete(activityLogs).where(eq(activityLogs.userId, testUserId));
  });

  describe("logActivity", () => {
    test("should log activity with all fields", async () => {
      const input: LogActivityInput = {
        projectId: testProjectId,
        taskId: testTaskId,
        userId: testUserId,
        activityType: "create",
        entityType: "task",
        entityId: testTaskId,
        changes: {
          title: { old: null, new: "New Task" },
        },
        metadata: {
          source: "api",
        },
      };

      await activityLogService.logActivity(input);

      // Verify the log was created
      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, testTaskId));

      expect(logs.length).toBe(1);
      expect(logs[0].projectId).toBe(testProjectId);
      expect(logs[0].taskId).toBe(testTaskId);
      expect(logs[0].userId).toBe(testUserId);
      expect(logs[0].activityType).toBe("create");
      expect(logs[0].entityType).toBe("task");
    });

    test("should log activity with minimal fields", async () => {
      const uniqueCommentId = `comment-${crypto.randomUUID()}`;
      const input: LogActivityInput = {
        userId: testUserId,
        activityType: "delete",
        entityType: "comment",
        entityId: uniqueCommentId,
      };

      await activityLogService.logActivity(input);

      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, uniqueCommentId));

      expect(logs.length).toBe(1);
      expect(logs[0].userId).toBe(testUserId);
      expect(logs[0].activityType).toBe("delete");
    });

    test("should log activity with changes tracking old and new values", async () => {
      const input: LogActivityInput = {
        projectId: testProjectId,
        userId: testUserId,
        activityType: "update",
        entityType: "task",
        entityId: testTaskId,
        changes: {
          title: { old: "Old Title", new: "New Title" },
          description: { old: "Old Desc", new: "New Desc" },
        },
      };

      await activityLogService.logActivity(input);

      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, testTaskId));

      expect(logs.length).toBe(1);
      expect(logs[0].changes).toBeDefined();
      const changes = logs[0].changes as any;
      expect(changes.title.old).toBe("Old Title");
      expect(changes.title.new).toBe("New Title");
    });

    test("should log status change activity", async () => {
      const input: LogActivityInput = {
        projectId: testProjectId,
        taskId: testTaskId,
        userId: testUserId,
        activityType: "status_change",
        entityType: "task",
        entityId: testTaskId,
        changes: {
          statusId: { old: "status-1", new: "status-2" },
        },
      };

      await activityLogService.logActivity(input);

      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, testTaskId));

      expect(logs.length).toBe(1);
      expect(logs[0].activityType).toBe("status_change");
    });

    test("should log assignment change activity", async () => {
      const input: LogActivityInput = {
        projectId: testProjectId,
        taskId: testTaskId,
        userId: testUserId,
        activityType: "assignment_change",
        entityType: "task",
        entityId: testTaskId,
        changes: {
          assignedTo: { old: "user-2", new: "user-3" },
        },
      };

      await activityLogService.logActivity(input);

      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, testTaskId));

      expect(logs.length).toBe(1);
      expect(logs[0].activityType).toBe("assignment_change");
    });

    test("should log member added activity", async () => {
      const input: LogActivityInput = {
        projectId: testProjectId,
        userId: testUserId,
        activityType: "member_added",
        entityType: "project",
        entityId: testProjectId,
        metadata: {
          memberId: "user-2",
        },
      };

      await activityLogService.logActivity(input);

      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.entityId, testProjectId));

      expect(logs.length).toBe(1);
      expect(logs[0].activityType).toBe("member_added");
    });
  });

  describe("listActivities", () => {
    test("should return empty array when user has no accessible projects", async () => {
      const otherUserId = crypto.randomUUID();
      const result = await activityLogService.listActivities({}, otherUserId);
      expect(result).toEqual([]);
    });

    test("should throw error when user doesn't have access to specified project", async () => {
      const otherUserId = crypto.randomUUID();

      try {
        await activityLogService.listActivities(
          { projectId: testProjectId },
          otherUserId
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ActivityLogError);
        expect((error as ActivityLogError).code).toBe(
          ActivityLogErrorCode.FORBIDDEN
        );
      }
    });

    test("should filter by activity type", async () => {
      // Create multiple activity logs
      await activityLogService.logActivity({
        projectId: testProjectId,
        userId: testUserId,
        activityType: "create",
        entityType: "task",
        entityId: testTaskId,
      });

      await activityLogService.logActivity({
        projectId: testProjectId,
        userId: testUserId,
        activityType: "update",
        entityType: "task",
        entityId: testTaskId,
      });

      const result = await activityLogService.listActivities(
        {
          projectId: testProjectId,
          activityType: "create",
        },
        testUserId
      );

      expect(result.length).toBe(1);
      expect(result[0].activityType).toBe("create");
    });

    test("should filter by user", async () => {
      await activityLogService.logActivity({
        projectId: testProjectId,
        userId: testUserId,
        activityType: "create",
        entityType: "task",
        entityId: testTaskId,
      });

      const result = await activityLogService.listActivities(
        {
          projectId: testProjectId,
          userId: testUserId,
        },
        testUserId
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].userId).toBe(testUserId);
    });

    test("should apply pagination", async () => {
      // Create multiple logs
      for (let i = 0; i < 5; i++) {
        await activityLogService.logActivity({
          projectId: testProjectId,
          userId: testUserId,
          activityType: "create",
          entityType: "task",
          entityId: `task-${i}`,
        });
      }

      const result = await activityLogService.listActivities(
        {
          projectId: testProjectId,
          limit: 2,
          offset: 1,
        },
        testUserId
      );

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getProjectActivity", () => {
    test("should get activity logs for a project", async () => {
      await activityLogService.logActivity({
        projectId: testProjectId,
        userId: testUserId,
        activityType: "create",
        entityType: "project",
        entityId: testProjectId,
      });

      const result = await activityLogService.getProjectActivity(
        testProjectId,
        testUserId
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].projectId).toBe(testProjectId);
    });

    test("should apply limit and offset", async () => {
      // Create multiple logs
      for (let i = 0; i < 5; i++) {
        await activityLogService.logActivity({
          projectId: testProjectId,
          userId: testUserId,
          activityType: "create",
          entityType: "task",
          entityId: `task-${i}`,
        });
      }

      const result = await activityLogService.getProjectActivity(
        testProjectId,
        testUserId,
        2,
        1
      );

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getTaskActivity", () => {
    test("should get activity logs for a task", async () => {
      await activityLogService.logActivity({
        projectId: testProjectId,
        taskId: testTaskId,
        userId: testUserId,
        activityType: "create",
        entityType: "task",
        entityId: testTaskId,
      });

      const result = await activityLogService.getTaskActivity(
        testTaskId,
        testUserId
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].taskId).toBe(testTaskId);
    });
  });
});
