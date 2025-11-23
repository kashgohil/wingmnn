import {
  attachments,
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
import * as fs from "fs/promises";
import * as path from "path";
import "../test-setup";
import { AttachmentError, attachmentService } from "./attachment.service";
import { projectService } from "./project.service";
import { subtaskService } from "./subtask.service";
import { taskService } from "./task.service";

describe("AttachmentService", () => {
  let testUserId: string;
  let otherUserId: string;
  let projectId: string;
  let taskId: string;
  let subtaskId: string;
  let workflowId: string;
  let subtaskWorkflowId: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "attachment-test-1@example.com",
        name: "Attachment Test User 1",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = user1[0].id;

    const user2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "attachment-test-2@example.com",
        name: "Attachment Test User 2",
        bio: "",
        passwordHash: null,
      })
      .returning();
    otherUserId = user2[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await db.delete(attachments);
      await db.delete(subtasks);
      await db.delete(tasks);
      await db.delete(projects);

      // Clean up workflow statuses first, then workflows
      const userWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.createdBy, testUserId));

      for (const workflow of userWorkflows) {
        await db
          .delete(workflowStatuses)
          .where(eq(workflowStatuses.workflowId, workflow.id));
      }

      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (otherUserId) {
      await db.delete(users).where(eq(users.id, otherUserId));
    }
  });

  beforeEach(async () => {
    // Clean up attachments before each test
    await db.delete(attachments);
    await db.delete(subtasks);
    await db.delete(tasks);
    await db.delete(projects);

    // Clean up ALL workflows and their statuses (including templates)
    // This ensures we have a clean slate for each test
    const allWorkflows = await db.select().from(workflows);

    for (const workflow of allWorkflows) {
      await db
        .delete(workflowStatuses)
        .where(eq(workflowStatuses.workflowId, workflow.id));
    }

    await db.delete(workflows);

    // Create task workflow directly
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

    await db.insert(workflowStatuses).values([
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
    ]);

    // Create subtask workflow
    const subtaskWorkflow = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Subtask Workflow",
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
        name: "Backlog",
        phase: "backlog",
        colorCode: "#gray",
        position: 0,
      },
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "Done",
        phase: "closed",
        colorCode: "#green",
        position: 1,
      },
    ]);

    // Verify subtask workflow was created with statuses
    const verifyStatuses = await db
      .select()
      .from(workflowStatuses)
      .where(eq(workflowStatuses.workflowId, subtaskWorkflowId));

    if (verifyStatuses.length === 0) {
      throw new Error(
        `No statuses found for subtask workflow ${subtaskWorkflowId}`
      );
    }

    // Create project
    const project = await projectService.createProject(
      {
        name: "Test Project",
        description: "Test project",
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
        description: "Test task description",
        priority: "medium",
      },
      testUserId
    );
    taskId = task.id;

    // Create subtask
    const subtask = await subtaskService.createSubtask(
      {
        taskId,
        title: "Test Subtask",
        description: "Test subtask description",
        priority: "low",
      },
      testUserId
    );
    subtaskId = subtask.id;
  });

  describe("uploadAttachment", () => {
    test("should upload attachment to task", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      expect(attachment.id).toBeDefined();
      expect(attachment.relatedEntityType).toBe("task");
      expect(attachment.relatedEntityId).toBe(taskId);
      expect(attachment.uploadedBy).toBe(testUserId);
      expect(attachment.originalFilename).toBe("test.txt");
      expect(attachment.mimeType).toBe("text/plain");
      expect(attachment.fileSize).toBe(fileContent.length);
      expect(attachment.storagePath).toBeDefined();
      expect(attachment.filename).toBeDefined();

      // Verify file exists on disk
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Clean up
      await fs.unlink(filePath).catch(() => {});
    });

    test("should upload attachment to subtask", async () => {
      const fileContent = Buffer.from("subtask file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "subtask",
          relatedEntityId: subtaskId,
          file: fileContent,
          originalFilename: "subtask.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      expect(attachment.relatedEntityType).toBe("subtask");
      expect(attachment.relatedEntityId).toBe(subtaskId);

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should reject file that is too large", async () => {
      // Create a buffer larger than 50MB
      const largeFile = Buffer.alloc(51 * 1024 * 1024);

      await expect(
        attachmentService.uploadAttachment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            file: largeFile,
            originalFilename: "large.bin",
            mimeType: "application/octet-stream",
          },
          testUserId
        )
      ).rejects.toThrow(AttachmentError);
    });

    test("should reject invalid MIME type", async () => {
      const fileContent = Buffer.from("test content");

      await expect(
        attachmentService.uploadAttachment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            file: fileContent,
            originalFilename: "test.exe",
            mimeType: "application/x-msdownload",
          },
          testUserId
        )
      ).rejects.toThrow(AttachmentError);
    });

    test("should reject upload for non-existent task", async () => {
      const fileContent = Buffer.from("test content");

      await expect(
        attachmentService.uploadAttachment(
          {
            relatedEntityType: "task",
            relatedEntityId: "non-existent-id",
            file: fileContent,
            originalFilename: "test.txt",
            mimeType: "text/plain",
          },
          testUserId
        )
      ).rejects.toThrow(AttachmentError);
    });

    test("should reject upload for task user doesn't have access to", async () => {
      const fileContent = Buffer.from("test content");

      await expect(
        attachmentService.uploadAttachment(
          {
            relatedEntityType: "task",
            relatedEntityId: taskId,
            file: fileContent,
            originalFilename: "test.txt",
            mimeType: "text/plain",
          },
          otherUserId
        )
      ).rejects.toThrow(AttachmentError);
    });
  });

  describe("getAttachmentUrl", () => {
    test("should generate secure URL for attachment", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const url = await attachmentService.getAttachmentUrl(
        attachment.id,
        testUserId
      );

      expect(url).toContain(`/api/attachments/${attachment.id}/download`);
      expect(url).toContain("token=");

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should reject URL generation for non-existent attachment", async () => {
      await expect(
        attachmentService.getAttachmentUrl("non-existent-id", testUserId)
      ).rejects.toThrow(AttachmentError);
    });

    test("should reject URL generation for user without access", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      await expect(
        attachmentService.getAttachmentUrl(attachment.id, otherUserId)
      ).rejects.toThrow(AttachmentError);

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });
  });

  describe("verifyToken", () => {
    test("should verify valid token", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const url = await attachmentService.getAttachmentUrl(
        attachment.id,
        testUserId
      );
      const token = url.split("token=")[1];

      const attachmentId = await attachmentService.verifyToken(token);
      expect(attachmentId).toBe(attachment.id);

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should reject expired token", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      // Generate token with 0 second expiration
      const url = await attachmentService.getAttachmentUrl(
        attachment.id,
        testUserId,
        0
      );
      const token = url.split("token=")[1];

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const attachmentId = await attachmentService.verifyToken(token);
      expect(attachmentId).toBeNull();

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should reject invalid token", async () => {
      const attachmentId = await attachmentService.verifyToken("invalid-token");
      expect(attachmentId).toBeNull();
    });
  });

  describe("deleteAttachment", () => {
    test("should delete attachment and file", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );

      // Verify file exists
      let exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Delete attachment
      await attachmentService.deleteAttachment(attachment.id, testUserId);

      // Verify file is deleted
      exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);

      // Verify database record is deleted
      const result = await db
        .select()
        .from(attachments)
        .where(eq(attachments.id, attachment.id));
      expect(result.length).toBe(0);
    });

    test("should reject deletion for non-existent attachment", async () => {
      await expect(
        attachmentService.deleteAttachment("non-existent-id", testUserId)
      ).rejects.toThrow(AttachmentError);
    });

    test("should reject deletion for user without access", async () => {
      const fileContent = Buffer.from("test file content");
      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      await expect(
        attachmentService.deleteAttachment(attachment.id, otherUserId)
      ).rejects.toThrow(AttachmentError);

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });
  });

  describe("listAttachments", () => {
    test("should list attachments for task", async () => {
      const file1 = Buffer.from("file 1");
      const file2 = Buffer.from("file 2");

      const attachment1 = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: file1,
          originalFilename: "file1.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const attachment2 = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: file2,
          originalFilename: "file2.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const attachmentsList = await attachmentService.listAttachments(
        "task",
        taskId,
        testUserId
      );

      expect(attachmentsList.length).toBe(2);
      expect(attachmentsList.map((a) => a.id)).toContain(attachment1.id);
      expect(attachmentsList.map((a) => a.id)).toContain(attachment2.id);

      // Clean up
      for (const att of [attachment1, attachment2]) {
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "attachments",
          att.storagePath
        );
        await fs.unlink(filePath).catch(() => {});
      }
    });

    test("should list attachments for subtask", async () => {
      const file1 = Buffer.from("subtask file");

      const attachment = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "subtask",
          relatedEntityId: subtaskId,
          file: file1,
          originalFilename: "subtask.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const attachmentsList = await attachmentService.listAttachments(
        "subtask",
        subtaskId,
        testUserId
      );

      expect(attachmentsList.length).toBe(1);
      expect(attachmentsList[0].id).toBe(attachment.id);

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        attachment.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should return empty list for entity with no attachments", async () => {
      const attachmentsList = await attachmentService.listAttachments(
        "task",
        taskId,
        testUserId
      );

      expect(attachmentsList.length).toBe(0);
    });

    test("should reject listing for user without access", async () => {
      await expect(
        attachmentService.listAttachments("task", taskId, otherUserId)
      ).rejects.toThrow(AttachmentError);
    });
  });

  describe("getAttachment", () => {
    test("should get attachment by ID", async () => {
      const fileContent = Buffer.from("test file content");
      const uploaded = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const attachment = await attachmentService.getAttachment(
        uploaded.id,
        testUserId
      );

      expect(attachment).not.toBeNull();
      expect(attachment!.id).toBe(uploaded.id);
      expect(attachment!.originalFilename).toBe("test.txt");

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        uploaded.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });

    test("should return null for non-existent attachment", async () => {
      const attachment = await attachmentService.getAttachment(
        "non-existent-id",
        testUserId
      );

      expect(attachment).toBeNull();
    });

    test("should return null for user without access", async () => {
      const fileContent = Buffer.from("test file content");
      const uploaded = await attachmentService.uploadAttachment(
        {
          relatedEntityType: "task",
          relatedEntityId: taskId,
          file: fileContent,
          originalFilename: "test.txt",
          mimeType: "text/plain",
        },
        testUserId
      );

      const attachment = await attachmentService.getAttachment(
        uploaded.id,
        otherUserId
      );

      expect(attachment).toBeNull();

      // Clean up
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "attachments",
        uploaded.storagePath
      );
      await fs.unlink(filePath).catch(() => {});
    });
  });
});
