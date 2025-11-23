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
import {
  SubtaskError,
  subtaskService,
  type CreateSubtaskInput,
} from "./subtask.service";
import { workflowService } from "./workflow.service";

describe("SubtaskService", () => {
  let testUserId: string;
  let testUserId2: string;
  let testProjectId: string;
  let testTaskId: string;
  let testWorkflowId: string;
  let testSubtaskWorkflowId: string;
  let testStatusId: string;
  let testSubtaskStatusId: string;

  // Create test users before all tests
  beforeAll(async () => {
    // Clean up any orphaned test data from previous runs
    await db.delete(subtasks);
    await db.delete(tasks);

    const user1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "subtask-test1@example.com",
        name: "Subtask Test User 1",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = user1[0].id;

    const user2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "subtask-test2@example.com",
        name: "Subtask Test User 2",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId2 = user2[0].id;
  });

  // Clean up test users after all tests
  afterAll(async () => {
    if (testUserId) {
      await db.delete(subtasks);
      await db.delete(tasks);
      await db.delete(projects).where(eq(projects.ownerId, testUserId));

      // Delete workflow statuses for test workflows only
      if (testWorkflowId) {
        await db
          .delete(workflowStatuses)
          .where(eq(workflowStatuses.workflowId, testWorkflowId));
      }
      if (testSubtaskWorkflowId) {
        await db
          .delete(workflowStatuses)
          .where(eq(workflowStatuses.workflowId, testSubtaskWorkflowId));
      }

      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (testUserId2) {
      await db.delete(users).where(eq(users.id, testUserId2));
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(subtasks);
    await db.delete(tasks);
    await db.delete(projects).where(eq(projects.ownerId, testUserId));

    // Delete workflow statuses for test workflows only
    if (testWorkflowId) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.workflowId, testWorkflowId));
    }
    if (testSubtaskWorkflowId) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.workflowId, testSubtaskWorkflowId));
    }

    // Delete test workflows
    await db.delete(workflows).where(eq(workflows.createdBy, testUserId));

    // Create a task workflow
    const taskWorkflow = await workflowService.createWorkflow(
      {
        name: "Test Task Workflow",
        workflowType: "task",
      },
      testUserId
    );
    testWorkflowId = taskWorkflow.id;

    // Add statuses to task workflow
    const taskStatus = await workflowService.addStatus(
      testWorkflowId,
      {
        name: "Backlog",
        phase: "backlog",
        colorCode: "#cccccc",
      },
      testUserId
    );
    testStatusId = taskStatus.id;

    await workflowService.addStatus(
      testWorkflowId,
      {
        name: "Done",
        phase: "closed",
        colorCode: "#00ff00",
      },
      testUserId
    );

    // Create a subtask workflow
    const subtaskWorkflow = await workflowService.createWorkflow(
      {
        name: "Test Subtask Workflow",
        workflowType: "subtask",
      },
      testUserId
    );
    testSubtaskWorkflowId = subtaskWorkflow.id;

    // Add statuses to subtask workflow
    const subtaskStatus = await workflowService.addStatus(
      testSubtaskWorkflowId,
      {
        name: "Subtask Backlog",
        phase: "backlog",
        colorCode: "#cccccc",
      },
      testUserId
    );
    testSubtaskStatusId = subtaskStatus.id;

    await workflowService.addStatus(
      testSubtaskWorkflowId,
      {
        name: "Subtask Done",
        phase: "closed",
        colorCode: "#00ff00",
      },
      testUserId
    );

    // Create a test project
    const project = await projectService.createProject(
      {
        name: "Test Project",
        workflowId: testWorkflowId,
      },
      testUserId
    );
    testProjectId = project.id;

    // Create a test task
    const task = await db
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
    testTaskId = task[0].id;
  });

  describe("createSubtask", () => {
    test("should create a subtask with all required fields", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        description: "Test description",
        priority: "high",
        statusId: testSubtaskStatusId,
      };

      const subtask = await subtaskService.createSubtask(input, testUserId);

      expect(subtask).toBeDefined();
      expect(subtask.id).toBeDefined();
      expect(subtask.taskId).toBe(testTaskId);
      expect(subtask.title).toBe("Test Subtask");
      expect(subtask.description).toBe("Test description");
      expect(subtask.priority).toBe("high");
      expect(subtask.statusId).toBe(testSubtaskStatusId);
      expect(subtask.progress).toBe(0);
    });

    test("should create a subtask with minimal fields", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Minimal Subtask",
        statusId: testSubtaskStatusId,
      };

      const subtask = await subtaskService.createSubtask(input, testUserId);

      expect(subtask).toBeDefined();
      expect(subtask.title).toBe("Minimal Subtask");
      expect(subtask.priority).toBe("medium");
      expect(subtask.description).toBeNull();
    });

    test("should use provided subtask status if valid", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        statusId: testSubtaskStatusId,
      };

      const subtask = await subtaskService.createSubtask(input, testUserId);

      expect(subtask.statusId).toBe(testSubtaskStatusId);
    });

    test("should reject task status for subtask", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        statusId: testStatusId, // This is a task status, not subtask
      };

      await expect(
        subtaskService.createSubtask(input, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should reject if parent task not found", async () => {
      const input: CreateSubtaskInput = {
        taskId: crypto.randomUUID(),
        title: "Test Subtask",
      };

      await expect(
        subtaskService.createSubtask(input, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should reject if user has no access to project", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
      };

      await expect(
        subtaskService.createSubtask(input, testUserId2)
      ).rejects.toThrow(SubtaskError);
    });

    test("should validate start date is before due date", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        startDate: new Date("2024-12-31"),
        dueDate: new Date("2024-01-01"),
      };

      await expect(
        subtaskService.createSubtask(input, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should allow equal start and due dates", async () => {
      const date = new Date("2024-06-15");
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        startDate: date,
        dueDate: date,
        statusId: testSubtaskStatusId,
      };

      const subtask = await subtaskService.createSubtask(input, testUserId);

      expect(subtask.startDate).toEqual(date);
      expect(subtask.dueDate).toEqual(date);
    });

    test("should validate assignee is project member", async () => {
      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        assignedTo: testUserId2,
      };

      await expect(
        subtaskService.createSubtask(input, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should allow assigning to project member", async () => {
      // Add user2 as project member
      await projectService.addMember(
        testProjectId,
        { userId: testUserId2 },
        testUserId
      );

      const input: CreateSubtaskInput = {
        taskId: testTaskId,
        title: "Test Subtask",
        assignedTo: testUserId2,
        statusId: testSubtaskStatusId,
      };

      const subtask = await subtaskService.createSubtask(input, testUserId);

      expect(subtask.assignedTo).toBe(testUserId2);
    });
  });

  describe("getSubtask", () => {
    test("should return subtask if user has access", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const subtask = await subtaskService.getSubtask(created.id, testUserId);

      expect(subtask).toBeDefined();
      expect(subtask?.id).toBe(created.id);
    });

    test("should return null if subtask not found", async () => {
      const subtask = await subtaskService.getSubtask(
        crypto.randomUUID(),
        testUserId
      );

      expect(subtask).toBeNull();
    });

    test("should return null if user has no access", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const subtask = await subtaskService.getSubtask(created.id, testUserId2);

      expect(subtask).toBeNull();
    });
  });

  describe("listSubtasks", () => {
    test("should return all subtasks for a task", async () => {
      await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 1",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 2",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const subtasksList = await subtaskService.listSubtasks(
        testTaskId,
        testUserId
      );

      expect(subtasksList).toHaveLength(2);
      expect(subtasksList[0].title).toBe("Subtask 1");
      expect(subtasksList[1].title).toBe("Subtask 2");
    });

    test("should return empty array if task not found", async () => {
      const subtasksList = await subtaskService.listSubtasks(
        crypto.randomUUID(),
        testUserId
      );

      expect(subtasksList).toHaveLength(0);
    });

    test("should return empty array if user has no access", async () => {
      await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 1",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const subtasksList = await subtaskService.listSubtasks(
        testTaskId,
        testUserId2
      );

      expect(subtasksList).toHaveLength(0);
    });

    test("should not include deleted subtasks", async () => {
      const subtask1 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 1",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 2",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      // Delete first subtask
      await subtaskService.deleteSubtask(subtask1.id, testUserId);

      const subtasksList = await subtaskService.listSubtasks(
        testTaskId,
        testUserId
      );

      expect(subtasksList).toHaveLength(1);
      expect(subtasksList[0].title).toBe("Subtask 2");
    });
  });

  describe("updateSubtask", () => {
    test("should update subtask fields", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Original Title",
          description: "Original description",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const updated = await subtaskService.updateSubtask(
        created.id,
        {
          title: "Updated Title",
          description: "Updated description",
          priority: "critical",
        },
        testUserId
      );

      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("Updated description");
      expect(updated.priority).toBe("critical");
    });

    test("should validate dates on update", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.updateSubtask(
          created.id,
          {
            startDate: new Date("2024-12-31"),
            dueDate: new Date("2024-01-01"),
          },
          testUserId
        )
      ).rejects.toThrow(SubtaskError);
    });

    test("should throw error if subtask not found", async () => {
      await expect(
        subtaskService.updateSubtask(
          crypto.randomUUID(),
          { title: "New Title" },
          testUserId
        )
      ).rejects.toThrow(SubtaskError);
    });

    test("should throw error if user has no access", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.updateSubtask(
          created.id,
          { title: "New Title" },
          testUserId2
        )
      ).rejects.toThrow(SubtaskError);
    });
  });

  describe("deleteSubtask", () => {
    test("should soft delete a subtask", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await subtaskService.deleteSubtask(created.id, testUserId);

      // Subtask should still exist in DB but with deletedAt set
      const result = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.id, created.id));

      expect(result).toHaveLength(1);
      expect(result[0].deletedAt).not.toBeNull();
    });

    test("should throw error if subtask not found", async () => {
      await expect(
        subtaskService.deleteSubtask(crypto.randomUUID(), testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should throw error if user has no access", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.deleteSubtask(created.id, testUserId2)
      ).rejects.toThrow(SubtaskError);
    });
  });

  describe("assignSubtask", () => {
    test("should assign subtask to a user", async () => {
      // Add user2 as project member
      await projectService.addMember(
        testProjectId,
        { userId: testUserId2 },
        testUserId
      );

      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await subtaskService.assignSubtask(created.id, testUserId2, testUserId);

      const subtask = await subtaskService.getSubtask(created.id, testUserId);
      expect(subtask?.assignedTo).toBe(testUserId2);
    });

    test("should reject if assignee is not project member", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.assignSubtask(created.id, testUserId2, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should throw error if subtask not found", async () => {
      await expect(
        subtaskService.assignSubtask(
          crypto.randomUUID(),
          testUserId2,
          testUserId
        )
      ).rejects.toThrow(SubtaskError);
    });
  });

  describe("unassignSubtask", () => {
    test("should unassign a subtask", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          assignedTo: testUserId,
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await subtaskService.unassignSubtask(created.id, testUserId);

      const subtask = await subtaskService.getSubtask(created.id, testUserId);
      expect(subtask?.assignedTo).toBeNull();
    });
  });

  describe("updateSubtaskStatus", () => {
    test("should update subtask status", async () => {
      // Create another subtask status
      const newStatus = await workflowService.addStatus(
        testSubtaskWorkflowId,
        {
          name: "In Progress",
          phase: "in_progress",
          colorCode: "#ffff00",
        },
        testUserId
      );

      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const updated = await subtaskService.updateSubtaskStatus(
        created.id,
        newStatus.id,
        testUserId
      );

      expect(updated.statusId).toBe(newStatus.id);
    });

    test("should reject task workflow status", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.updateSubtaskStatus(created.id, testStatusId, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should throw error if subtask not found", async () => {
      await expect(
        subtaskService.updateSubtaskStatus(
          crypto.randomUUID(),
          testSubtaskStatusId,
          testUserId
        )
      ).rejects.toThrow(SubtaskError);
    });
  });

  describe("updateProgress", () => {
    test("should update subtask progress", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      const updated = await subtaskService.updateProgress(
        created.id,
        50,
        testUserId
      );

      expect(updated.progress).toBe(50);
    });

    test("should reject progress less than 0", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.updateProgress(created.id, -1, testUserId)
      ).rejects.toThrow(SubtaskError);
    });

    test("should reject progress greater than 100", async () => {
      const created = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Test Subtask",
          statusId: testSubtaskStatusId,
        },
        testUserId
      );

      await expect(
        subtaskService.updateProgress(created.id, 101, testUserId)
      ).rejects.toThrow(SubtaskError);
    });
  });
});
