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
import { projectService } from "./project.service";
import { subtaskService } from "./subtask.service";
import { taskService } from "./task.service";

describe("Progress Tracking", () => {
  let testUserId: string;
  let testProjectId: string;
  let testTaskId: string;
  let taskWorkflowId: string;
  let subtaskWorkflowId: string;
  let taskStatusId: string;
  let subtaskStatusId: string;

  beforeAll(async () => {
    // Create test user
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Progress Test User",
        bio: "Test bio",
        email: `progress-test-${Date.now()}@example.com`,
        passwordHash: "test-hash",
      })
      .returning();
    testUserId = userResult[0].id;

    // Create task workflow
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
    taskWorkflowId = taskWorkflowResult[0].id;

    // Create task workflow status
    const taskStatusResult = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId: taskWorkflowId,
        name: "Backlog",
        phase: "backlog",
        colorCode: "#808080",
        position: 1,
      })
      .returning();
    taskStatusId = taskStatusResult[0].id;

    // Create subtask workflow
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
    subtaskWorkflowId = subtaskWorkflowResult[0].id;

    // Create subtask workflow status
    const subtaskStatusResult = await db
      .insert(workflowStatuses)
      .values({
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "Backlog",
        phase: "backlog",
        colorCode: "#808080",
        position: 1,
      })
      .returning();
    subtaskStatusId = subtaskStatusResult[0].id;

    // Create test project
    const project = await projectService.createProject(
      {
        name: "Progress Test Project",
        description: "Test project for progress tracking",
        workflowId: taskWorkflowId,
      },
      testUserId
    );
    testProjectId = project.id;

    // Create test task
    const task = await taskService.createTask(
      {
        projectId: testProjectId,
        title: "Test Task",
        description: "Test task for progress tracking",
        statusId: taskStatusId,
        estimatedPoints: 10,
      },
      testUserId
    );
    testTaskId = task.id;
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(projects).where(eq(projects.id, testProjectId));
    await db.delete(workflows).where(eq(workflows.id, taskWorkflowId));
    await db.delete(workflows).where(eq(workflows.id, subtaskWorkflowId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  beforeEach(async () => {
    // Reset task progress
    await db.update(tasks).set({ progress: 0 }).where(eq(tasks.id, testTaskId));

    // Delete any existing subtasks
    await db.delete(subtasks).where(eq(subtasks.taskId, testTaskId));
  });

  describe("Manual Progress Updates", () => {
    test("should update task progress manually", async () => {
      const updatedTask = await taskService.updateProgress(
        testTaskId,
        50,
        testUserId
      );

      expect(updatedTask.progress).toBe(50);
    });

    test("should reject progress less than 0", async () => {
      await expect(
        taskService.updateProgress(testTaskId, -1, testUserId)
      ).rejects.toThrow("Progress must be between 0 and 100");
    });

    test("should reject progress greater than 100", async () => {
      await expect(
        taskService.updateProgress(testTaskId, 101, testUserId)
      ).rejects.toThrow("Progress must be between 0 and 100");
    });
  });

  describe("Automatic Progress Calculation from Subtasks", () => {
    test("should calculate progress as average of subtasks", async () => {
      // Create 3 subtasks
      const subtask1 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 1",
          statusId: subtaskStatusId,
        },
        testUserId
      );

      const subtask2 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 2",
          statusId: subtaskStatusId,
        },
        testUserId
      );

      const subtask3 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 3",
          statusId: subtaskStatusId,
        },
        testUserId
      );

      // Update subtask progress: 0%, 50%, 100%
      await subtaskService.updateProgress(subtask1.id, 0, testUserId);
      await subtaskService.updateProgress(subtask2.id, 50, testUserId);
      await subtaskService.updateProgress(subtask3.id, 100, testUserId);

      // Check task progress (should be average: (0 + 50 + 100) / 3 = 50)
      const task = await taskService.getTask(testTaskId, testUserId);
      expect(task?.progress).toBe(50);
    });

    test("should update parent task progress to 100 when all subtasks complete", async () => {
      // Create 2 subtasks
      const subtask1 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 1",
          statusId: subtaskStatusId,
        },
        testUserId
      );

      const subtask2 = await subtaskService.createSubtask(
        {
          taskId: testTaskId,
          title: "Subtask 2",
          statusId: subtaskStatusId,
        },
        testUserId
      );

      // Complete both subtasks
      await subtaskService.updateProgress(subtask1.id, 100, testUserId);
      await subtaskService.updateProgress(subtask2.id, 100, testUserId);

      // Check task progress (should be 100)
      const task = await taskService.getTask(testTaskId, testUserId);
      expect(task?.progress).toBe(100);
    });

    test("should return 0 progress for task with no subtasks", async () => {
      const progress = await taskService.calculateProgress(testTaskId);
      expect(progress).toBe(0);
    });
  });

  describe("Project-Level Progress Calculation", () => {
    test("should calculate project progress as weighted average", async () => {
      // Create another task with different estimate
      const task2 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Test Task 2",
          statusId: taskStatusId,
          estimatedPoints: 20,
        },
        testUserId
      );

      // Set progress: task1 (10 points) = 50%, task2 (20 points) = 100%
      await taskService.updateProgress(testTaskId, 50, testUserId);
      await taskService.updateProgress(task2.id, 100, testUserId);

      // Calculate project progress
      // Weighted average: (10 * 50 + 20 * 100) / (10 + 20) = 2500 / 30 = 83.33 ≈ 83
      const projectProgress = await projectService.calculateProjectProgress(
        testProjectId,
        testUserId
      );

      expect(projectProgress).toBe(83);

      // Clean up
      await db.delete(tasks).where(eq(tasks.id, task2.id));
    });

    test("should treat tasks equally when no estimates provided", async () => {
      // First, remove the estimate from the test task
      await db
        .update(tasks)
        .set({ estimatedPoints: null, estimatedHours: null })
        .where(eq(tasks.id, testTaskId));

      // Create tasks without estimates
      const task2 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Test Task 2",
          statusId: taskStatusId,
        },
        testUserId
      );

      const task3 = await taskService.createTask(
        {
          projectId: testProjectId,
          title: "Test Task 3",
          statusId: taskStatusId,
        },
        testUserId
      );

      // Set progress: task1 = 0%, task2 = 50%, task3 = 100%
      await taskService.updateProgress(testTaskId, 0, testUserId);
      await taskService.updateProgress(task2.id, 50, testUserId);
      await taskService.updateProgress(task3.id, 100, testUserId);

      // Calculate project progress (should be average: (0 + 50 + 100) / 3 = 50)
      const projectProgress = await projectService.calculateProjectProgress(
        testProjectId,
        testUserId
      );

      expect(projectProgress).toBe(50);

      // Clean up
      await db.delete(tasks).where(eq(tasks.id, task2.id));
      await db.delete(tasks).where(eq(tasks.id, task3.id));

      // Restore the estimate for other tests
      await db
        .update(tasks)
        .set({ estimatedPoints: 10 })
        .where(eq(tasks.id, testTaskId));
    });

    test("should return 0 for project with no tasks", async () => {
      // Create a new project with no tasks
      const emptyProject = await projectService.createProject(
        {
          name: "Empty Project",
          workflowId: taskWorkflowId,
        },
        testUserId
      );

      const projectProgress = await projectService.calculateProjectProgress(
        emptyProject.id,
        testUserId
      );

      expect(projectProgress).toBe(0);

      // Clean up
      await db.delete(projects).where(eq(projects.id, emptyProject.id));
    });

    test("should reject access for non-member", async () => {
      // Create another user
      const otherUser = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Other User",
          bio: "Test bio",
          email: `other-${Date.now()}@example.com`,
          passwordHash: "test-hash",
        })
        .returning();

      await expect(
        projectService.calculateProjectProgress(testProjectId, otherUser[0].id)
      ).rejects.toThrow("You do not have access to this project");

      // Clean up
      await db.delete(users).where(eq(users.id, otherUser[0].id));
    });
  });
});
