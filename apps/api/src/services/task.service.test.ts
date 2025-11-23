import {
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
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import "../test-setup";
import {
  TaskError,
  TaskErrorCode,
  taskService,
  type CreateTaskInput,
} from "./task.service";

describe("TaskService", () => {
  let testUserId: string;
  let testUserId2: string;
  let testWorkflowId: string;
  let testProjectId: string;
  let testStatusId: string;
  let testClosedStatusId: string;

  // Create test users before all tests
  beforeAll(async () => {
    const result1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "task-test@example.com",
        name: "Task Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = result1[0].id;

    const result2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "task-test2@example.com",
        name: "Task Test User 2",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId2 = result2[0].id;
  });

  // Clean up test users after all tests
  afterAll(async () => {
    if (testUserId) {
      await db.delete(tasks).where(eq(tasks.createdBy, testUserId));
      await db.delete(projects).where(eq(projects.ownerId, testUserId));
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (testUserId2) {
      await db.delete(users).where(eq(users.id, testUserId2));
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data
    if (testUserId) {
      await db.delete(tasks).where(eq(tasks.createdBy, testUserId));
      await db.delete(projects).where(eq(projects.ownerId, testUserId));
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
    }

    // Create a test workflow
    const workflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Task Workflow",
        description: "Test workflow for task tests",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();

    testWorkflowId = workflowResult[0].id;

    // Add required statuses to workflow
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
    testClosedStatusId = statusResults[1].id;

    // Create a test project
    const projectResult = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: "Test Project",
        description: "Test project for task tests",
        ownerId: testUserId,
        workflowId: testWorkflowId,
        status: "active",
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();

    testProjectId = projectResult[0].id;
  });

  afterEach(async () => {
    // Clean up test data
    if (testUserId) {
      await db.delete(tasks).where(eq(tasks.createdBy, testUserId));
      await db.delete(projects).where(eq(projects.ownerId, testUserId));
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
    }
  });

  describe("createTask", () => {
    test("should create a task with all fields", async () => {
      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Test Task",
        description: "Test task description",
        priority: "high",
        startDate: new Date("2024-01-01"),
        dueDate: new Date("2024-01-31"),
        estimatedHours: 10,
        estimatedPoints: 5,
      };

      const task = await taskService.createTask(taskData, testUserId);

      expect(task).toBeDefined();
      expect(task.title).toBe("Test Task");
      expect(task.description).toBe("Test task description");
      expect(task.priority).toBe("high");
      expect(task.projectId).toBe(testProjectId);
      expect(task.statusId).toBe(testStatusId);
      expect(task.progress).toBe(0);
      expect(task.estimatedHours).toBe(10);
      expect(task.estimatedPoints).toBe(5);
    });

    test("should create a task with minimal fields", async () => {
      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Minimal Task",
      };

      const task = await taskService.createTask(taskData, testUserId);

      expect(task).toBeDefined();
      expect(task.title).toBe("Minimal Task");
      expect(task.description).toBeNull();
      expect(task.priority).toBe("medium");
      expect(task.statusId).toBe(testStatusId);
    });

    test("should reject task creation with invalid dates", async () => {
      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Invalid Dates Task",
        startDate: new Date("2024-01-31"),
        dueDate: new Date("2024-01-01"),
      };

      await expect(
        taskService.createTask(taskData, testUserId)
      ).rejects.toThrow(TaskError);

      try {
        await taskService.createTask(taskData, testUserId);
      } catch (error) {
        expect((error as TaskError).code).toBe(TaskErrorCode.INVALID_DATES);
      }
    });

    test("should reject task creation for non-member", async () => {
      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Unauthorized Task",
      };

      await expect(
        taskService.createTask(taskData, testUserId2)
      ).rejects.toThrow(TaskError);

      try {
        await taskService.createTask(taskData, testUserId2);
      } catch (error) {
        expect((error as TaskError).code).toBe(TaskErrorCode.FORBIDDEN);
      }
    });

    test("should reject task creation in archived project", async () => {
      // Archive the project
      await db
        .update(projects)
        .set({ status: "archived" })
        .where(eq(projects.id, testProjectId));

      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Archived Project Task",
      };

      await expect(
        taskService.createTask(taskData, testUserId)
      ).rejects.toThrow(TaskError);

      try {
        await taskService.createTask(taskData, testUserId);
      } catch (error) {
        expect((error as TaskError).code).toBe(TaskErrorCode.ARCHIVED_PROJECT);
      }
    });

    test("should allow equal start and due dates", async () => {
      const sameDate = new Date("2024-01-15");
      const taskData: CreateTaskInput = {
        projectId: testProjectId,
        title: "Same Date Task",
        startDate: sameDate,
        dueDate: sameDate,
      };

      const task = await taskService.createTask(taskData, testUserId);

      expect(task).toBeDefined();
      expect(task.startDate).toEqual(sameDate);
      expect(task.dueDate).toEqual(sameDate);
    });
  });

  describe("getTask", () => {
    test("should get a task by ID", async () => {
      const created = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Get Task Test",
        },
        testUserId
      );

      const task = await taskService.getTask(created.id, testUserId);

      expect(task).toBeDefined();
      expect(task?.id).toBe(created.id);
      expect(task?.title).toBe("Get Task Test");
    });

    test("should return null for non-existent task", async () => {
      const task = await taskService.getTask("non-existent-id", testUserId);

      expect(task).toBeNull();
    });

    test("should return null for task without access", async () => {
      const created = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "No Access Task",
        },
        testUserId
      );

      const task = await taskService.getTask(created.id, testUserId2);

      expect(task).toBeNull();
    });
  });

  describe("listTasks", () => {
    test("should list tasks for a project", async () => {
      await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Task 1",
        },
        testUserId
      );

      await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Task 2",
        },
        testUserId
      );

      const taskList = await taskService.listTasks(
        { projectId: testProjectId },
        testUserId
      );

      expect(taskList.length).toBe(2);
    });

    test("should filter tasks by status", async () => {
      const task1 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Backlog Task",
        },
        testUserId
      );

      const task2 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Done Task",
        },
        testUserId
      );

      // Update task2 to closed status
      await taskService.updateTaskStatus(
        task2.id,
        testClosedStatusId,
        testUserId
      );

      const backlogTasks = await taskService.listTasks(
        { projectId: testProjectId, statusId: testStatusId },
        testUserId
      );

      expect(backlogTasks.length).toBe(1);
      expect(backlogTasks[0].id).toBe(task1.id);
    });

    test("should filter tasks by priority", async () => {
      await taskService.createTask(
        {
          projectId: testProjectId,
          title: "High Priority Task",
          priority: "high",
        },
        testUserId
      );

      await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Low Priority Task",
          priority: "low",
        },
        testUserId
      );

      const highPriorityTasks = await taskService.listTasks(
        { projectId: testProjectId, priority: "high" },
        testUserId
      );

      expect(highPriorityTasks.length).toBe(1);
      expect(highPriorityTasks[0].priority).toBe("high");
    });

    test("should exclude deleted tasks by default", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "To Be Deleted",
        },
        testUserId
      );

      await taskService.deleteTask(task.id, testUserId);

      const taskList = await taskService.listTasks(
        { projectId: testProjectId },
        testUserId
      );

      expect(taskList.length).toBe(0);
    });

    test("should include deleted tasks when requested", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "To Be Deleted",
        },
        testUserId
      );

      await taskService.deleteTask(task.id, testUserId);

      const taskList = await taskService.listTasks(
        { projectId: testProjectId, includeDeleted: true },
        testUserId
      );

      expect(taskList.length).toBe(1);
      expect(taskList[0].deletedAt).not.toBeNull();
    });
  });

  describe("updateTask", () => {
    test("should update task fields", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Original Title",
          description: "Original Description",
        },
        testUserId
      );

      const updated = await taskService.updateTask(
        task.id,
        {
          title: "Updated Title",
          description: "Updated Description",
          priority: "critical",
        },
        testUserId
      );

      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("Updated Description");
      expect(updated.priority).toBe("critical");
    });

    test("should validate dates on update", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Date Update Task",
        },
        testUserId
      );

      await expect(
        taskService.updateTask(
          task.id,
          {
            startDate: new Date("2024-01-31"),
            dueDate: new Date("2024-01-01"),
          },
          testUserId
        )
      ).rejects.toThrow(TaskError);
    });

    test("should throw error for non-existent task", async () => {
      await expect(
        taskService.updateTask(
          "non-existent-id",
          { title: "New Title" },
          testUserId
        )
      ).rejects.toThrow(TaskError);
    });
  });

  describe("deleteTask", () => {
    test("should soft delete a task", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "To Delete",
        },
        testUserId
      );

      await taskService.deleteTask(task.id, testUserId);

      const deleted = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, task.id))
        .limit(1);

      expect(deleted[0].deletedAt).not.toBeNull();
    });

    test("should throw error for non-existent task", async () => {
      await expect(
        taskService.deleteTask("non-existent-id", testUserId)
      ).rejects.toThrow(TaskError);
    });
  });

  describe("assignTask", () => {
    test("should assign a task to a user", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "To Assign",
        },
        testUserId
      );

      await taskService.assignTask(task.id, testUserId, testUserId);

      const assigned = await taskService.getTask(task.id, testUserId);

      expect(assigned?.assignedTo).toBe(testUserId);
    });

    test("should reject assignment to non-member", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Invalid Assignment",
        },
        testUserId
      );

      await expect(
        taskService.assignTask(task.id, testUserId2, testUserId)
      ).rejects.toThrow(TaskError);
    });
  });

  describe("unassignTask", () => {
    test("should unassign a task", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "To Unassign",
          assignedTo: testUserId,
        },
        testUserId
      );

      await taskService.unassignTask(task.id, testUserId);

      const unassigned = await taskService.getTask(task.id, testUserId);

      expect(unassigned?.assignedTo).toBeNull();
    });
  });

  describe("updateTaskStatus", () => {
    test("should update task status", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Status Update Task",
        },
        testUserId
      );

      const updated = await taskService.updateTaskStatus(
        task.id,
        testClosedStatusId,
        testUserId
      );

      expect(updated.statusId).toBe(testClosedStatusId);
    });

    test("should reject invalid status", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Invalid Status Task",
        },
        testUserId
      );

      await expect(
        taskService.updateTaskStatus(task.id, "invalid-status-id", testUserId)
      ).rejects.toThrow(TaskError);
    });
  });

  describe("updateProgress", () => {
    test("should update task progress", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Progress Task",
        },
        testUserId
      );

      const updated = await taskService.updateProgress(task.id, 50, testUserId);

      expect(updated.progress).toBe(50);
    });

    test("should reject invalid progress values", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Invalid Progress Task",
        },
        testUserId
      );

      await expect(
        taskService.updateProgress(task.id, 150, testUserId)
      ).rejects.toThrow(TaskError);

      await expect(
        taskService.updateProgress(task.id, -10, testUserId)
      ).rejects.toThrow(TaskError);
    });
  });

  describe("calculateProgress", () => {
    test("should return 0 for task with no subtasks", async () => {
      const task = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "No Subtasks Task",
        },
        testUserId
      );

      const progress = await taskService.calculateProgress(task.id);

      expect(progress).toBe(0);
    });
  });
});
