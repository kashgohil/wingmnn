import {
  comments,
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
import { CommentError, commentService } from "./comment.service";
import { projectService } from "./project.service";
import { subtaskService } from "./subtask.service";
import { taskService } from "./task.service";

describe("CommentService", () => {
  let testUserId: string;
  let otherUserId: string;
  let projectId: string;
  let taskId: string;
  let subtaskId: string;
  let workflowId: string;
  let subtaskWorkflowId: string;
  let statusId: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "comment-test-1@example.com",
        name: "Comment Test User 1",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = user1[0].id;

    const user2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "comment-test-2@example.com",
        name: "Comment Test User 2",
        bio: "",
        passwordHash: null,
      })
      .returning();
    otherUserId = user2[0].id;
  });

  afterAll(async () => {
    // Clean up test users
    if (testUserId) {
      await db.delete(comments);
      await db.delete(subtasks);
      await db.delete(tasks);
      await db.delete(projects);
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (otherUserId) {
      await db.delete(users).where(eq(users.id, otherUserId));
    }
  });

  beforeEach(async () => {
    // Clean up
    await db.delete(comments);
    await db.delete(subtasks);
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(workflows).where(eq(workflows.createdBy, testUserId));

    // Create workflow
    const workflow = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Workflow",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    workflowId = workflow[0].id;

    const statuses = await db
      .insert(workflowStatuses)
      .values([
        {
          id: crypto.randomUUID(),
          workflowId,
          name: "Backlog",
          phase: "backlog",
          colorCode: "#gray",
          position: 0,
        },
        {
          id: crypto.randomUUID(),
          workflowId,
          name: "Done",
          phase: "closed",
          colorCode: "#green",
          position: 1,
        },
      ])
      .returning();
    statusId = statuses[0].id;

    // Create project
    const project = await projectService.createProject(
      {
        name: "Test Project",
        workflowId,
      },
      testUserId
    );
    projectId = project.id;

    // Create task
    const task = await taskService.createTask(
      {
        projectId,
        title: "Test Task",
        priority: "medium",
      },
      testUserId
    );
    taskId = task.id;

    // Create subtask workflow
    const subtaskWorkflow = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Subtask Workflow",
        workflowType: "subtask",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    subtaskWorkflowId = subtaskWorkflow[0].id;

    await db.insert(workflowStatuses).values([
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "Todo",
        phase: "backlog",
        colorCode: "#gray",
        position: 0,
      },
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "Complete",
        phase: "closed",
        colorCode: "#green",
        position: 1,
      },
    ]);

    // Create subtask
    const subtask = await subtaskService.createSubtask(
      {
        taskId,
        title: "Test Subtask",
        priority: "medium",
      },
      testUserId
    );
    subtaskId = subtask.id;
  });

  describe("createComment", () => {
    test("should create a comment on a task", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "This is a test comment",
        },
        testUserId
      );

      expect(comment.id).toBeDefined();
      expect(comment.relatedEntityType).toBe("task");
      expect(comment.relatedEntityId).toBe(taskId);
      expect(comment.authorId).toBe(testUserId);
      expect(comment.content).toBe("This is a test comment");
      expect(comment.parentCommentId).toBeNull();
      expect(comment.editedAt).toBeNull();
      expect(comment.createdAt).toBeDefined();
    });

    test("should create a comment on a subtask", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "subtask",
          relatedEntityId: subtaskId,
          content: "Subtask comment",
        },
        testUserId
      );

      expect(comment.relatedEntityType).toBe("subtask");
      expect(comment.relatedEntityId).toBe(subtaskId);
      expect(comment.content).toBe("Subtask comment");
    });

    test("should reject empty content", async () => {
      await expect(
        commentService.createComment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            content: "",
          },
          testUserId
        )
      ).rejects.toThrow(CommentError);

      await expect(
        commentService.createComment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            content: "   ",
          },
          testUserId
        )
      ).rejects.toThrow(CommentError);
    });

    test("should reject comment on non-existent task", async () => {
      await expect(
        commentService.createComment(
          {
            relatedEntityType: "task",
            relatedEntityId: "non-existent",
            content: "Test",
          },
          testUserId
        )
      ).rejects.toThrow(CommentError);
    });

    test("should reject comment from non-member", async () => {
      await expect(
        commentService.createComment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            content: "Test",
          },
          otherUserId
        )
      ).rejects.toThrow(CommentError);
    });

    test("should create comment with parent", async () => {
      const parent = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Parent comment",
        },
        testUserId
      );

      const reply = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          parentCommentId: parent.id,
          content: "Reply comment",
        },
        testUserId
      );

      expect(reply.parentCommentId).toBe(parent.id);
    });

    test("should reject parent from different entity", async () => {
      const parent = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Parent comment",
        },
        testUserId
      );

      await expect(
        commentService.createComment(
          {
            relatedEntityType: "subtask",
            relatedEntityId: subtaskId,
            parentCommentId: parent.id,
            content: "Reply",
          },
          testUserId
        )
      ).rejects.toThrow(CommentError);
    });
  });

  describe("replyToComment", () => {
    test("should create a reply to a comment", async () => {
      const parent = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Parent comment",
        },
        testUserId
      );

      const reply = await commentService.replyToComment(
        parent.id,
        "This is a reply",
        testUserId
      );

      expect(reply.parentCommentId).toBe(parent.id);
      expect(reply.content).toBe("This is a reply");
      expect(reply.relatedEntityType).toBe(parent.relatedEntityType);
      expect(reply.relatedEntityId).toBe(parent.relatedEntityId);
    });

    test("should reject reply to non-existent comment", async () => {
      await expect(
        commentService.replyToComment("non-existent", "Reply", testUserId)
      ).rejects.toThrow(CommentError);
    });
  });

  describe("updateComment", () => {
    test("should update comment content and set editedAt", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Original content",
        },
        testUserId
      );

      expect(comment.editedAt).toBeNull();

      const updated = await commentService.updateComment(
        comment.id,
        "Updated content",
        testUserId
      );

      expect(updated.content).toBe("Updated content");
      expect(updated.editedAt).not.toBeNull();
      expect(updated.editedAt).toBeInstanceOf(Date);
    });

    test("should reject empty content", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Original",
        },
        testUserId
      );

      await expect(
        commentService.updateComment(comment.id, "", testUserId)
      ).rejects.toThrow(CommentError);
    });

    test("should reject update by non-author", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Original",
        },
        testUserId
      );

      // Add other user as member
      await projectService.addMember(
        projectId,
        { userId: otherUserId },
        testUserId
      );

      await expect(
        commentService.updateComment(comment.id, "Updated", otherUserId)
      ).rejects.toThrow(CommentError);
    });

    test("should reject update of non-existent comment", async () => {
      await expect(
        commentService.updateComment("non-existent", "Updated", testUserId)
      ).rejects.toThrow(CommentError);
    });
  });

  describe("deleteComment", () => {
    test("should delete a comment", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "To be deleted",
        },
        testUserId
      );

      await commentService.deleteComment(comment.id, testUserId);

      const result = await db
        .select()
        .from(comments)
        .where(eq(comments.id, comment.id));

      expect(result.length).toBe(0);
    });

    test("should cascade delete replies", async () => {
      const parent = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Parent",
        },
        testUserId
      );

      const reply = await commentService.replyToComment(
        parent.id,
        "Reply",
        testUserId
      );

      await commentService.deleteComment(parent.id, testUserId);

      const parentResult = await db
        .select()
        .from(comments)
        .where(eq(comments.id, parent.id));
      const replyResult = await db
        .select()
        .from(comments)
        .where(eq(comments.id, reply.id));

      expect(parentResult.length).toBe(0);
      expect(replyResult.length).toBe(0);
    });

    test("should reject delete by non-author", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Original",
        },
        testUserId
      );

      // Add other user as member
      await projectService.addMember(
        projectId,
        { userId: otherUserId },
        testUserId
      );

      await expect(
        commentService.deleteComment(comment.id, otherUserId)
      ).rejects.toThrow(CommentError);
    });

    test("should reject delete of non-existent comment", async () => {
      await expect(
        commentService.deleteComment("non-existent", testUserId)
      ).rejects.toThrow(CommentError);
    });
  });

  describe("listComments", () => {
    test("should list comments with nested structure", async () => {
      const comment1 = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "First comment",
        },
        testUserId
      );

      const comment2 = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Second comment",
        },
        testUserId
      );

      const reply1 = await commentService.replyToComment(
        comment1.id,
        "Reply to first",
        testUserId
      );

      const reply2 = await commentService.replyToComment(
        comment1.id,
        "Another reply to first",
        testUserId
      );

      const list = await commentService.listComments(
        "task",
        taskId,
        testUserId
      );

      expect(list.length).toBe(2);
      expect(list[0].id).toBe(comment1.id);
      expect(list[0].replies?.length).toBe(2);
      expect(list[0].replies![0].id).toBe(reply1.id);
      expect(list[0].replies![1].id).toBe(reply2.id);
      expect(list[1].id).toBe(comment2.id);
      expect(list[1].replies?.length).toBe(0);
    });

    test("should return empty array for entity with no comments", async () => {
      const list = await commentService.listComments(
        "task",
        taskId,
        testUserId
      );

      expect(list.length).toBe(0);
    });

    test("should order comments by creation time", async () => {
      const comment1 = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "First",
        },
        testUserId
      );

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const comment2 = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Second",
        },
        testUserId
      );

      const list = await commentService.listComments(
        "task",
        taskId,
        testUserId
      );

      expect(list[0].id).toBe(comment1.id);
      expect(list[1].id).toBe(comment2.id);
    });

    test("should reject list for non-member", async () => {
      await expect(
        commentService.listComments("task", taskId, otherUserId)
      ).rejects.toThrow(CommentError);
    });
  });

  describe("getCommentThread", () => {
    test("should get comment with all replies", async () => {
      const parent = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Parent",
        },
        testUserId
      );

      const reply1 = await commentService.replyToComment(
        parent.id,
        "Reply 1",
        testUserId
      );

      const reply2 = await commentService.replyToComment(
        parent.id,
        "Reply 2",
        testUserId
      );

      const thread = await commentService.getCommentThread(
        parent.id,
        testUserId
      );

      expect(thread).not.toBeNull();
      expect(thread!.id).toBe(parent.id);
      expect(thread!.replies?.length).toBe(2);
    });

    test("should return null for non-existent comment", async () => {
      const thread = await commentService.getCommentThread(
        "non-existent",
        testUserId
      );

      expect(thread).toBeNull();
    });

    test("should return null for non-member", async () => {
      const comment = await commentService.createComment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          content: "Test",
        },
        testUserId
      );

      const thread = await commentService.getCommentThread(
        comment.id,
        otherUserId
      );

      expect(thread).toBeNull();
    });
  });
});
