import {
  audits,
  db,
  eq,
  projects,
  tasks,
  timeEntries,
  users,
  workflows,
} from "@wingmnn/db";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import "../test-setup";
import { projectService } from "./project.service";
import { taskService } from "./task.service";
import {
  TimeTrackingError,
  timeTrackingService,
} from "./time-tracking.service";
import { workflowService } from "./workflow.service";

describe("TimeTrackingService", () => {
  let testUserId: string;
  let testUser2Id: string;
  let testProjectId: string;
  let testTaskId: string;
  let testWorkflowId: string;

  beforeAll(async () => {
    // Create test users once
    const user1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Time Tracking Test User",
        bio: "",
        email: "timetracking-test@example.com",
        passwordHash: "hash",
      })
      .returning();
    testUserId = user1[0].id;

    const user2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Time Tracking Test User 2",
        bio: "",
        email: "timetracking-test2@example.com",
        passwordHash: "hash",
      })
      .returning();
    testUser2Id = user2[0].id;
  });

  afterAll(async () => {
    // Clean up in correct order
    await db.delete(timeEntries);
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
    await db.delete(audits).where(eq(audits.userId, testUserId));
    await db.delete(audits).where(eq(audits.userId, testUser2Id));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, testUser2Id));
  });

  beforeEach(async () => {
    // Clean up test data before each test (but not workflows - they're reused)
    await db.delete(timeEntries);
    await db.delete(tasks);
    await db.delete(projects);

    // Create test workflow if not exists
    if (!testWorkflowId) {
      const workflow = await workflowService.createWorkflow(
        {
          name: "Test Workflow",
          workflowType: "task",
        },
        testUserId
      );
      testWorkflowId = workflow.id;

      // Add statuses to the workflow
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
    }

    // Create test project
    const project = await projectService.createProject(
      {
        name: "Test Project",
        workflowId: testWorkflowId,
      },
      testUserId
    );
    testProjectId = project.id;

    // Create test task
    const task = await taskService.createTask(
      {
        projectId: testProjectId,
        title: "Test Task",
      },
      testUserId
    );
    testTaskId = task.id;
  });

  describe("createTimeEntry", () => {
    test("should create a time entry for a task", async () => {
      const entry = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
          description: "Working on task",
        },
        testUserId
      );

      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(testUserId);
      expect(entry.relatedEntityType).toBe("task");
      expect(entry.relatedEntityId).toBe(testTaskId);
      expect(entry.durationMinutes).toBe(60);
      expect(entry.description).toBe("Working on task");
    });

    test("should reject negative duration", async () => {
      await expect(
        timeTrackingService.createTimeEntry(
          {
            relatedEntityType: "task",
            relatedEntityId: testTaskId,
            durationMinutes: -10,
            date: new Date(),
          },
          testUserId
        )
      ).rejects.toThrow(TimeTrackingError);
    });

    test("should reject zero duration", async () => {
      await expect(
        timeTrackingService.createTimeEntry(
          {
            relatedEntityType: "task",
            relatedEntityId: testTaskId,
            durationMinutes: 0,
            date: new Date(),
          },
          testUserId
        )
      ).rejects.toThrow(TimeTrackingError);
    });

    test("should reject time entry for non-existent task", async () => {
      await expect(
        timeTrackingService.createTimeEntry(
          {
            relatedEntityType: "task",
            relatedEntityId: "non-existent",
            durationMinutes: 60,
            date: new Date(),
          },
          testUserId
        )
      ).rejects.toThrow(TimeTrackingError);
    });

    test("should reject time entry for task user doesn't have access to", async () => {
      await expect(
        timeTrackingService.createTimeEntry(
          {
            relatedEntityType: "task",
            relatedEntityId: testTaskId,
            durationMinutes: 60,
            date: new Date(),
          },
          testUser2Id
        )
      ).rejects.toThrow(TimeTrackingError);
    });
  });

  describe("getTimeEntry", () => {
    test("should get a time entry by ID", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      const entry = await timeTrackingService.getTimeEntry(
        created.id,
        testUserId
      );

      expect(entry).not.toBeNull();
      expect(entry?.id).toBe(created.id);
    });

    test("should return null for non-existent entry", async () => {
      const entry = await timeTrackingService.getTimeEntry(
        "non-existent",
        testUserId
      );

      expect(entry).toBeNull();
    });

    test("should return null for entry user doesn't have access to", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      const entry = await timeTrackingService.getTimeEntry(
        created.id,
        testUser2Id
      );

      expect(entry).toBeNull();
    });
  });

  describe("updateTimeEntry", () => {
    test("should update time entry duration", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      const updated = await timeTrackingService.updateTimeEntry(
        created.id,
        { durationMinutes: 90 },
        testUserId
      );

      expect(updated.durationMinutes).toBe(90);
    });

    test("should update time entry date", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
        },
        testUserId
      );

      const newDate = new Date("2024-01-02");
      const updated = await timeTrackingService.updateTimeEntry(
        created.id,
        { date: newDate },
        testUserId
      );

      expect(updated.date.toISOString()).toBe(newDate.toISOString());
    });

    test("should update time entry description", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
          description: "Original",
        },
        testUserId
      );

      const updated = await timeTrackingService.updateTimeEntry(
        created.id,
        { description: "Updated" },
        testUserId
      );

      expect(updated.description).toBe("Updated");
    });

    test("should reject negative duration update", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await expect(
        timeTrackingService.updateTimeEntry(
          created.id,
          { durationMinutes: -10 },
          testUserId
        )
      ).rejects.toThrow(TimeTrackingError);
    });

    test("should reject update by different user", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      // Add user2 as project member
      await projectService.addMember(
        testProjectId,
        { userId: testUser2Id },
        testUserId
      );

      await expect(
        timeTrackingService.updateTimeEntry(
          created.id,
          { durationMinutes: 90 },
          testUser2Id
        )
      ).rejects.toThrow(TimeTrackingError);
    });
  });

  describe("deleteTimeEntry", () => {
    test("should delete a time entry", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await timeTrackingService.deleteTimeEntry(created.id, testUserId);

      const entry = await timeTrackingService.getTimeEntry(
        created.id,
        testUserId
      );
      expect(entry).toBeNull();
    });

    test("should reject deletion by different user", async () => {
      const created = await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      // Add user2 as project member
      await projectService.addMember(
        testProjectId,
        { userId: testUser2Id },
        testUserId
      );

      await expect(
        timeTrackingService.deleteTimeEntry(created.id, testUser2Id)
      ).rejects.toThrow(TimeTrackingError);
    });

    test("should reject deletion of non-existent entry", async () => {
      await expect(
        timeTrackingService.deleteTimeEntry("non-existent", testUserId)
      ).rejects.toThrow(TimeTrackingError);
    });
  });

  describe("listTimeEntries", () => {
    test("should list time entries for user", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date("2024-01-02"),
        },
        testUserId
      );

      const entries = await timeTrackingService.listTimeEntries({}, testUserId);

      expect(entries.length).toBe(2);
    });

    test("should filter by entity type", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      const entries = await timeTrackingService.listTimeEntries(
        { relatedEntityType: "task" },
        testUserId
      );

      expect(entries.length).toBe(1);
      expect(entries[0].relatedEntityType).toBe("task");
    });

    test("should filter by entity ID", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      const entries = await timeTrackingService.listTimeEntries(
        { relatedEntityId: testTaskId },
        testUserId
      );

      expect(entries.length).toBe(1);
      expect(entries[0].relatedEntityId).toBe(testTaskId);
    });

    test("should filter by date range", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date("2024-01-15"),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 45,
          date: new Date("2024-02-01"),
        },
        testUserId
      );

      const entries = await timeTrackingService.listTimeEntries(
        {
          dateFrom: new Date("2024-01-01"),
          dateTo: new Date("2024-01-31"),
        },
        testUserId
      );

      expect(entries.length).toBe(2);
    });

    test("should apply pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await timeTrackingService.createTimeEntry(
          {
            relatedEntityType: "task",
            relatedEntityId: testTaskId,
            durationMinutes: 60,
            date: new Date(),
          },
          testUserId
        );
      }

      const entries = await timeTrackingService.listTimeEntries(
        { limit: 2, offset: 1 },
        testUserId
      );

      expect(entries.length).toBe(2);
    });
  });

  describe("getTimeSummary", () => {
    test("should calculate total time", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date(),
        },
        testUserId
      );

      const summary = await timeTrackingService.getTimeSummary(
        { taskId: testTaskId },
        testUserId
      );

      expect(summary.totalMinutes).toBe(90);
    });

    test("should group by task", async () => {
      const task2 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Test Task 2",
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: task2.id,
          durationMinutes: 30,
          date: new Date(),
        },
        testUserId
      );

      const summary = await timeTrackingService.getTimeSummary(
        { groupBy: "task" },
        testUserId
      );

      expect(summary.entries.length).toBe(2);
      expect(summary.totalMinutes).toBe(90);
    });

    test("should group by user", async () => {
      // Add user2 as project member
      await projectService.addMember(
        testProjectId,
        { userId: testUser2Id },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date(),
        },
        testUser2Id
      );

      const summary = await timeTrackingService.getTimeSummary(
        { projectId: testProjectId, groupBy: "user" },
        testUserId
      );

      expect(summary.entries.length).toBe(2);
      expect(summary.totalMinutes).toBe(90);
    });

    test("should group by date", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date("2024-01-02"),
        },
        testUserId
      );

      const summary = await timeTrackingService.getTimeSummary(
        { groupBy: "date" },
        testUserId
      );

      expect(summary.entries.length).toBe(2);
      expect(summary.totalMinutes).toBe(90);
    });

    test("should filter by date range", async () => {
      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date("2024-01-01"),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 30,
          date: new Date("2024-02-01"),
        },
        testUserId
      );

      const summary = await timeTrackingService.getTimeSummary(
        {
          dateFrom: new Date("2024-01-01"),
          dateTo: new Date("2024-01-31"),
        },
        testUserId
      );

      expect(summary.totalMinutes).toBe(60);
    });

    test("should filter by project", async () => {
      const project2 = await projectService.createProject(
        {
          name: "Test Project 2",
          workflowId: testWorkflowId,
        },
        testUserId
      );

      const task2 = await taskService.createTask(
        {
          projectId: project2.id,
          title: "Test Task 2",
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: testTaskId,
          durationMinutes: 60,
          date: new Date(),
        },
        testUserId
      );

      await timeTrackingService.createTimeEntry(
        {
          relatedEntityType: "task",
          relatedEntityId: task2.id,
          durationMinutes: 30,
          date: new Date(),
        },
        testUserId
      );

      const summary = await timeTrackingService.getTimeSummary(
        { projectId: testProjectId },
        testUserId
      );

      expect(summary.totalMinutes).toBe(60);
    });
  });
});
