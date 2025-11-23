import {
  db,
  eq,
  projects,
  tags,
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
  CreateTagInput,
  TagError,
  TagErrorCode,
  tagService,
  UpdateTagInput,
} from "./tag.service";

describe("TagService", () => {
  let testUserId: string;
  let testProjectId: string;
  let testWorkflowId: string;
  let testTaskId: string;

  beforeAll(async () => {
    const userResult = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "tag-test@example.com",
        name: "Tag Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = userResult[0].id;

    const workflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Workflow",
        description: "Test workflow for tag tests",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();
    testWorkflowId = workflowResult[0].id;

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

    const projectResult = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: "Test Project",
        description: "Test project for tag tests",
        ownerId: testUserId,
        workflowId: testWorkflowId,
        status: "active",
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();
    testProjectId = projectResult[0].id;

    const taskResult = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        projectId: testProjectId,
        title: "Test Task",
        description: "Test task for tag tests",
        statusId: statusResults[0].id,
        priority: "medium",
        progress: 0,
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning();
    testTaskId = taskResult[0].id;
  });

  afterAll(async () => {
    try {
      // Clean up in reverse order of dependencies
      await db.delete(tags);

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
    } catch (error) {
      console.error("Cleanup error in tag.service.test:", error);
    }
  });

  afterEach(async () => {
    if (testProjectId) {
      await db.delete(tags).where(eq(tags.projectId, testProjectId));
    }
  });

  describe("createTag", () => {
    test("should create a tag with valid input", async () => {
      const input: CreateTagInput = {
        name: "Bug",
        description: "Bug fixes",
        colorCode: "#ff0000",
        projectId: testProjectId,
      };

      const result = await tagService.createTag(input, testUserId);

      expect(result).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.description).toBe(input.description ?? null);
      expect(result.colorCode).toBe(input.colorCode ?? "#ffffff");
      expect(result.projectId).toBe(testProjectId);
      expect(result.createdBy).toBe(testUserId);
      expect(result.updatedBy).toBe(testUserId);
    });

    test("should throw error if user has no project access", async () => {
      const input: CreateTagInput = {
        name: "Bug",
        projectId: testProjectId,
      };

      const otherUserId = crypto.randomUUID();

      try {
        await tagService.createTag(input, otherUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.FORBIDDEN);
        expect((error as TagError).statusCode).toBe(403);
      }
    });

    test("should throw error if tag name already exists in project", async () => {
      const input: CreateTagInput = {
        name: "Duplicate",
        projectId: testProjectId,
      };

      await tagService.createTag(input, testUserId);

      try {
        await tagService.createTag(input, testUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.DUPLICATE_TAG_NAME);
        expect((error as TagError).statusCode).toBe(409);
      }
    });

    test("should use default color code if not provided", async () => {
      const input: CreateTagInput = {
        name: "DefaultColor",
        projectId: testProjectId,
      };

      const result = await tagService.createTag(input, testUserId);

      expect(result.colorCode).toBe("#ffffff");
    });
  });

  describe("getTag", () => {
    test("should return tag if user has access", async () => {
      const input: CreateTagInput = {
        name: "GetTest",
        description: "Get test tag",
        colorCode: "#ff0000",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(input, testUserId);
      const result = await tagService.getTag(created.id, testUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.name).toBe(input.name);
    });

    test("should return null if tag not found", async () => {
      const nonExistentId = crypto.randomUUID();
      const result = await tagService.getTag(nonExistentId, testUserId);

      expect(result).toBeNull();
    });

    test("should return null if user has no access", async () => {
      const input: CreateTagInput = {
        name: "NoAccessTest",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(input, testUserId);
      const otherUserId = crypto.randomUUID();
      const result = await tagService.getTag(created.id, otherUserId);

      expect(result).toBeNull();
    });
  });

  describe("updateTag", () => {
    test("should update tag with valid input", async () => {
      const createInput: CreateTagInput = {
        name: "Bug",
        description: "Original description",
        colorCode: "#ffffff",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(createInput, testUserId);

      const updateInput: UpdateTagInput = {
        name: "Critical Bug",
        colorCode: "#ff0000",
      };

      const result = await tagService.updateTag(
        created.id,
        updateInput,
        testUserId
      );

      expect(result.name).toBe(updateInput.name!);
      expect(result.colorCode).toBe(updateInput.colorCode!);
      expect(result.updatedBy).toBe(testUserId);
    });

    test("should throw error if tag not found", async () => {
      const input: UpdateTagInput = {
        name: "Critical Bug",
      };

      const nonExistentId = crypto.randomUUID();

      try {
        await tagService.updateTag(nonExistentId, input, testUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.TAG_NOT_FOUND);
        expect((error as TagError).statusCode).toBe(404);
      }
    });

    test("should throw error if user has no access", async () => {
      const createInput: CreateTagInput = {
        name: "Bug",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(createInput, testUserId);

      const updateInput: UpdateTagInput = {
        name: "Critical Bug",
      };

      const otherUserId = crypto.randomUUID();

      try {
        await tagService.updateTag(created.id, updateInput, otherUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.FORBIDDEN);
        expect((error as TagError).statusCode).toBe(403);
      }
    });
  });

  describe("deleteTag", () => {
    test("should delete tag if user has access", async () => {
      const input: CreateTagInput = {
        name: "DeleteTest",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(input, testUserId);

      await tagService.deleteTag(created.id, testUserId);

      const result = await tagService.getTag(created.id, testUserId);
      expect(result).toBeNull();
    });

    test("should throw error if tag not found", async () => {
      const nonExistentId = crypto.randomUUID();

      try {
        await tagService.deleteTag(nonExistentId, testUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.TAG_NOT_FOUND);
        expect((error as TagError).statusCode).toBe(404);
      }
    });

    test("should throw error if user has no access", async () => {
      const input: CreateTagInput = {
        name: "NoDeleteAccess",
        projectId: testProjectId,
      };

      const created = await tagService.createTag(input, testUserId);
      const otherUserId = crypto.randomUUID();

      try {
        await tagService.deleteTag(created.id, otherUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.FORBIDDEN);
        expect((error as TagError).statusCode).toBe(403);
      }
    });
  });

  describe("addTagToTask", () => {
    test("should add tag to task successfully", async () => {
      const tagInput: CreateTagInput = {
        name: "TaskTag",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);

      await tagService.addTagToTask(testTaskId, tag.id, testUserId);

      const taskTags = await tagService.listTaskTags(testTaskId, testUserId);
      expect(taskTags.length).toBe(1);
      expect(taskTags[0].id).toBe(tag.id);
    });

    test("should throw error if task not found", async () => {
      const tagInput: CreateTagInput = {
        name: "NoTaskTag",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);
      const nonExistentTaskId = crypto.randomUUID();

      try {
        await tagService.addTagToTask(nonExistentTaskId, tag.id, testUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.TASK_NOT_FOUND);
        expect((error as TagError).statusCode).toBe(404);
      }
    });

    test("should throw error if tag not found", async () => {
      const nonExistentTagId = crypto.randomUUID();

      try {
        await tagService.addTagToTask(testTaskId, nonExistentTagId, testUserId);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.TAG_NOT_FOUND);
        expect((error as TagError).statusCode).toBe(404);
      }
    });

    test("should not create duplicate associations", async () => {
      const tagInput: CreateTagInput = {
        name: "DuplicateAssoc",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);

      await tagService.addTagToTask(testTaskId, tag.id, testUserId);
      await tagService.addTagToTask(testTaskId, tag.id, testUserId);

      const taskTags = await tagService.listTaskTags(testTaskId, testUserId);
      const matchingTags = taskTags.filter((t) => t.id === tag.id);
      expect(matchingTags.length).toBe(1);
    });
  });

  describe("removeTagFromTask", () => {
    test("should remove tag from task successfully", async () => {
      const tagInput: CreateTagInput = {
        name: "RemoveTag",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);

      await tagService.addTagToTask(testTaskId, tag.id, testUserId);

      let taskTags = await tagService.listTaskTags(testTaskId, testUserId);
      expect(taskTags.length).toBeGreaterThan(0);

      await tagService.removeTagFromTask(testTaskId, tag.id, testUserId);

      taskTags = await tagService.listTaskTags(testTaskId, testUserId);
      const matchingTags = taskTags.filter((t) => t.id === tag.id);
      expect(matchingTags.length).toBe(0);
    });

    test("should throw error if task not found", async () => {
      const tagInput: CreateTagInput = {
        name: "RemoveNoTask",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);
      const nonExistentTaskId = crypto.randomUUID();

      try {
        await tagService.removeTagFromTask(
          nonExistentTaskId,
          tag.id,
          testUserId
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TagError);
        expect((error as TagError).code).toBe(TagErrorCode.TASK_NOT_FOUND);
        expect((error as TagError).statusCode).toBe(404);
      }
    });
  });

  describe("listTags", () => {
    test("should list all tags for a project", async () => {
      const tag1Input: CreateTagInput = {
        name: "Tag1",
        projectId: testProjectId,
      };
      const tag2Input: CreateTagInput = {
        name: "Tag2",
        projectId: testProjectId,
      };

      await tagService.createTag(tag1Input, testUserId);
      await tagService.createTag(tag2Input, testUserId);

      const tags = await tagService.listTags(testProjectId, testUserId);

      expect(tags.length).toBeGreaterThanOrEqual(2);
      const tagNames = tags.map((t) => t.name);
      expect(tagNames).toContain("Tag1");
      expect(tagNames).toContain("Tag2");
    });
  });

  describe("listTasksByTag", () => {
    test("should list all tasks with a specific tag", async () => {
      const tagInput: CreateTagInput = {
        name: "ListTasksTag",
        projectId: testProjectId,
      };

      const tag = await tagService.createTag(tagInput, testUserId);
      await tagService.addTagToTask(testTaskId, tag.id, testUserId);

      const taskIds = await tagService.listTasksByTag(tag.id, testUserId);

      expect(taskIds.length).toBeGreaterThan(0);
      expect(taskIds).toContain(testTaskId);
    });
  });
});
