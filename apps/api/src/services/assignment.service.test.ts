import {
  db,
  eq,
  projects,
  subtasks,
  tasks,
  users,
  workflows,
} from "@wingmnn/db";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  AssignmentError,
  AssignmentErrorCode,
  assignmentService,
} from "./assignment.service";
import { projectService } from "./project.service";
import { subtaskService } from "./subtask.service";
import { taskService } from "./task.service";
import { workflowService } from "./workflow.service";

describe("AssignmentService", () => {
  let testUserId: string;
  let testUser2Id: string;
  let testUser3Id: string;
  let testProjectId: string;
  let testWorkflowId: string;
  let testTaskId: string;
  let testSubtaskId: string;

  beforeEach(async () => {
    // Create test users
    const user1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Test User 1",
        bio: "Test bio 1",
        email: `test-${Date.now()}-1@example.com`,
        passwordHash: "hash",
      })
      .returning();
    testUserId = user1[0].id;

    const user2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Test User 2",
        bio: "Test bio 2",
        email: `test-${Date.now()}-2@example.com`,
        passwordHash: "hash",
      })
      .returning();
    testUser2Id = user2[0].id;

    const user3 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "Test User 3",
        bio: "Test bio 3",
        email: `test-${Date.now()}-3@example.com`,
        passwordHash: "hash",
      })
      .returning();
    testUser3Id = user3[0].id;

    // Create a test workflow
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

    // Create a subtask workflow
    const subtaskWorkflow = await workflowService.createWorkflow(
      {
        name: "Test Subtask Workflow",
        workflowType: "subtask",
      },
      testUserId
    );

    // Add statuses to the subtask workflow
    await workflowService.addStatus(
      subtaskWorkflow.id,
      {
        name: "Backlog",
        phase: "backlog",
        colorCode: "#gray",
        position: 0,
      },
      testUserId
    );

    await workflowService.addStatus(
      subtaskWorkflow.id,
      {
        name: "Done",
        phase: "closed",
        colorCode: "#green",
        position: 1,
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

    // Add user2 as a project member
    await projectService.addMember(
      testProjectId,
      { userId: testUser2Id },
      testUserId
    );

    // Create a test task
    const task = await taskService.createTask(
      {
        projectId: testProjectId,
        title: "Test Task",
      },
      testUserId
    );
    testTaskId = task.id;

    // Create a test subtask
    const subtask = await subtaskService.createSubtask(
      {
        taskId: testTaskId,
        title: "Test Subtask",
      },
      testUserId
    );
    testSubtaskId = subtask.id;
  });

  afterEach(async () => {
    // Clean up test data in correct order (respecting foreign key constraints)
    try {
      if (testSubtaskId) {
        await db
          .delete(subtasks)
          .where(eq(subtasks.id, testSubtaskId))
          .catch(() => {});
      }
      if (testTaskId) {
        await db
          .delete(tasks)
          .where(eq(tasks.id, testTaskId))
          .catch(() => {});
      }
      if (testProjectId) {
        await db
          .delete(projects)
          .where(eq(projects.id, testProjectId))
          .catch(() => {});
      }
      // Delete workflows before users since workflows reference users
      if (testWorkflowId) {
        await db
          .delete(workflows)
          .where(eq(workflows.id, testWorkflowId))
          .catch(() => {});
      }
      if (testUserId) {
        await db
          .delete(users)
          .where(eq(users.id, testUserId))
          .catch(() => {});
      }
      if (testUser2Id) {
        await db
          .delete(users)
          .where(eq(users.id, testUser2Id))
          .catch(() => {});
      }
      if (testUser3Id) {
        await db
          .delete(users)
          .where(eq(users.id, testUser3Id))
          .catch(() => {});
      }
    } catch (error) {
      console.error("Cleanup error in assignment.service.test:", error);
    }
  });

  describe("assignTask", () => {
    test("should assign a task to a project member", async () => {
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, testTaskId))
        .limit(1);

      expect(task[0].assignedTo).toBe(testUser2Id);
    });

    test("should reject assignment to non-project member", async () => {
      await expect(
        assignmentService.assignTask(testTaskId, testUser3Id, testUserId)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignTask(testTaskId, testUser3Id, testUserId);
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.INVALID_ASSIGNEE
        );
      }
    });

    test("should reject assignment by non-project member", async () => {
      await expect(
        assignmentService.assignTask(testTaskId, testUser2Id, testUser3Id)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignTask(
          testTaskId,
          testUser2Id,
          testUser3Id
        );
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.FORBIDDEN
        );
      }
    });

    test("should reject assignment to non-existent task", async () => {
      const fakeTaskId = crypto.randomUUID();

      await expect(
        assignmentService.assignTask(fakeTaskId, testUser2Id, testUserId)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignTask(fakeTaskId, testUser2Id, testUserId);
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.TASK_NOT_FOUND
        );
      }
    });

    test("should replace existing assignment (single assignment enforcement)", async () => {
      // First assignment
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      // Reassignment
      await assignmentService.assignTask(testTaskId, testUserId, testUserId);

      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, testTaskId))
        .limit(1);

      expect(task[0].assignedTo).toBe(testUserId);
    });
  });

  describe("unassignTask", () => {
    test("should unassign a task", async () => {
      // First assign
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      // Then unassign
      await assignmentService.unassignTask(testTaskId, testUserId);

      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, testTaskId))
        .limit(1);

      expect(task[0].assignedTo).toBeNull();
    });

    test("should reject unassignment by non-project member", async () => {
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      await expect(
        assignmentService.unassignTask(testTaskId, testUser3Id)
      ).rejects.toThrow(AssignmentError);
    });

    test("should reject unassignment of non-existent task", async () => {
      const fakeTaskId = crypto.randomUUID();

      await expect(
        assignmentService.unassignTask(fakeTaskId, testUserId)
      ).rejects.toThrow(AssignmentError);
    });
  });

  describe("assignSubtask", () => {
    test("should assign a subtask to a project member", async () => {
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUser2Id,
        testUserId
      );

      const subtask = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.id, testSubtaskId))
        .limit(1);

      expect(subtask[0].assignedTo).toBe(testUser2Id);
    });

    test("should reject assignment to non-project member", async () => {
      await expect(
        assignmentService.assignSubtask(testSubtaskId, testUser3Id, testUserId)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignSubtask(
          testSubtaskId,
          testUser3Id,
          testUserId
        );
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.INVALID_ASSIGNEE
        );
      }
    });

    test("should reject assignment by non-project member", async () => {
      await expect(
        assignmentService.assignSubtask(testSubtaskId, testUser2Id, testUser3Id)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignSubtask(
          testSubtaskId,
          testUser2Id,
          testUser3Id
        );
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.FORBIDDEN
        );
      }
    });

    test("should reject assignment to non-existent subtask", async () => {
      const fakeSubtaskId = crypto.randomUUID();

      await expect(
        assignmentService.assignSubtask(fakeSubtaskId, testUser2Id, testUserId)
      ).rejects.toThrow(AssignmentError);

      try {
        await assignmentService.assignSubtask(
          fakeSubtaskId,
          testUser2Id,
          testUserId
        );
      } catch (error) {
        expect((error as AssignmentError).code).toBe(
          AssignmentErrorCode.SUBTASK_NOT_FOUND
        );
      }
    });

    test("should replace existing assignment (single assignment enforcement)", async () => {
      // First assignment
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUser2Id,
        testUserId
      );

      // Reassignment
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUserId,
        testUserId
      );

      const subtask = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.id, testSubtaskId))
        .limit(1);

      expect(subtask[0].assignedTo).toBe(testUserId);
    });
  });

  describe("unassignSubtask", () => {
    test("should unassign a subtask", async () => {
      // First assign
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUser2Id,
        testUserId
      );

      // Then unassign
      await assignmentService.unassignSubtask(testSubtaskId, testUserId);

      const subtask = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.id, testSubtaskId))
        .limit(1);

      expect(subtask[0].assignedTo).toBeNull();
    });

    test("should reject unassignment by non-project member", async () => {
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUser2Id,
        testUserId
      );

      await expect(
        assignmentService.unassignSubtask(testSubtaskId, testUser3Id)
      ).rejects.toThrow(AssignmentError);
    });

    test("should reject unassignment of non-existent subtask", async () => {
      const fakeSubtaskId = crypto.randomUUID();

      await expect(
        assignmentService.unassignSubtask(fakeSubtaskId, testUserId)
      ).rejects.toThrow(AssignmentError);
    });
  });

  describe("listAssignments", () => {
    test("should list all assignments for a user", async () => {
      // Assign the task and subtask to user2
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);
      await assignmentService.assignSubtask(
        testSubtaskId,
        testUser2Id,
        testUserId
      );

      // List assignments for user2
      const assignments = await assignmentService.listAssignments(
        testUser2Id,
        testUserId
      );

      expect(assignments.length).toBe(2);
      expect(
        assignments.some((a) => a.id === testTaskId && a.type === "task")
      ).toBe(true);
      expect(
        assignments.some((a) => a.id === testSubtaskId && a.type === "subtask")
      ).toBe(true);
    });

    test("should return empty list when user has no assignments", async () => {
      const assignments = await assignmentService.listAssignments(
        testUser2Id,
        testUserId
      );

      expect(assignments.length).toBe(0);
    });

    test("should only return assignments from accessible projects", async () => {
      // Create another project that user2 doesn't have access to
      const workflow2 = await workflowService.createWorkflow(
        {
          name: "Test Workflow 2",
          workflowType: "task",
        },
        testUser3Id
      );

      // Add statuses to workflow2
      await workflowService.addStatus(
        workflow2.id,
        {
          name: "Backlog",
          phase: "backlog",
          colorCode: "#gray",
          position: 0,
        },
        testUser3Id
      );

      await workflowService.addStatus(
        workflow2.id,
        {
          name: "Done",
          phase: "closed",
          colorCode: "#green",
          position: 1,
        },
        testUser3Id
      );

      const project2 = await projectService.createProject(
        {
          name: "Test Project 2",
          workflowId: workflow2.id,
        },
        testUser3Id
      );

      // Add testUser2 as a member of project2 so we can assign them
      await projectService.addMember(
        project2.id,
        { userId: testUser2Id },
        testUser3Id
      );

      const task2 = await taskService.createTask(
        {
          projectId: project2.id,
          title: "Test Task 2",
        },
        testUser3Id
      );

      // Assign task2 to testUser2 in project2 (which testUser1 doesn't have access to)
      await assignmentService.assignTask(task2.id, testUser2Id, testUser3Id);

      // Assign task in accessible project
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      // User1 should only see assignments from their accessible projects
      const assignments = await assignmentService.listAssignments(
        testUser2Id,
        testUserId
      );

      expect(assignments.length).toBe(1);
      expect(assignments[0].id).toBe(testTaskId);

      // Clean up
      await db.delete(tasks).where(eq(tasks.id, task2.id));
      await db.delete(projects).where(eq(projects.id, project2.id));
    });

    test("should include project information in assignments", async () => {
      await assignmentService.assignTask(testTaskId, testUser2Id, testUserId);

      const assignments = await assignmentService.listAssignments(
        testUser2Id,
        testUserId
      );

      expect(assignments[0].projectId).toBe(testProjectId);
      expect(assignments[0].projectName).toBe("Test Project");
    });
  });
});
