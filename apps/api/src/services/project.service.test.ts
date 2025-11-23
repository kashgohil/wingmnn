import {
  db,
  eq,
  projectMembers,
  projects as projectsTable,
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
  ProjectError,
  ProjectErrorCode,
  projectService,
  type CreateProjectInput,
} from "./project.service";

describe("ProjectService", () => {
  let testUserId: string;
  let testWorkflowId: string;
  let testProjectId: string;

  // Create a test user before all tests
  beforeAll(async () => {
    const result = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: `project-test-${crypto.randomUUID()}@example.com`,
        name: "Project Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = result[0].id;
  });

  // Clean up test user after all tests
  afterAll(async () => {
    if (testUserId) {
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.ownerId, testUserId));
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data
    if (testUserId) {
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.ownerId, testUserId));
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
    }

    // Create a test workflow
    const workflowResult = await db
      .insert(workflows)
      .values({
        id: crypto.randomUUID(),
        name: "Test Workflow",
        description: "Test workflow for project tests",
        workflowType: "task",
        createdBy: testUserId,
        isTemplate: false,
      })
      .returning();

    testWorkflowId = workflowResult[0].id;

    // Add required statuses to workflow
    await db.insert(workflowStatuses).values([
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
    ]);
  });

  afterEach(async () => {
    // Clean up test data
    if (testProjectId) {
      await db.delete(projectsTable).where(eq(projectsTable.id, testProjectId));
    }
    if (testWorkflowId) {
      await db.delete(workflows).where(eq(workflows.id, testWorkflowId));
    }
  });

  describe("createProject", () => {
    test("should create a project with valid workflow", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        description: "A test project",
        workflowId: testWorkflowId,
      };

      const project = await projectService.createProject(input, testUserId);
      testProjectId = project.id;

      expect(project).toBeDefined();
      expect(project.name).toBe(input.name);
      expect(project.description).toBe(input.description!);
      expect(project.ownerId).toBe(testUserId);
      expect(project.workflowId).toBe(testWorkflowId);
      expect(project.status).toBe("active");
      expect(project.createdBy).toBe(testUserId);
      expect(project.updatedBy).toBe(testUserId);
    });

    test("should throw error when workflow does not exist", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: "non-existent-workflow-id",
      };

      await expect(
        projectService.createProject(input, testUserId)
      ).rejects.toThrow(ProjectError);

      try {
        await projectService.createProject(input, testUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectError);
        expect((error as ProjectError).code).toBe(
          ProjectErrorCode.WORKFLOW_NOT_FOUND
        );
        expect((error as ProjectError).statusCode).toBe(404);
      }
    });
  });

  describe("getProject", () => {
    test("should return project for owner", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const project = await projectService.getProject(
        testProjectId,
        testUserId
      );

      expect(project).toBeDefined();
      expect(project?.id).toBe(testProjectId);
      expect(project?.name).toBe(input.name);
    });

    test("should return null for non-member", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();
      const project = await projectService.getProject(
        testProjectId,
        otherUserId
      );

      expect(project).toBeNull();
    });
  });

  describe("updateProject", () => {
    test("should update project name and description", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const updated = await projectService.updateProject(
        testProjectId,
        { name: "Updated Project", description: "Updated description" },
        testUserId
      );

      expect(updated.name).toBe("Updated Project");
      expect(updated.description).toBe("Updated description");
      expect(updated.updatedBy).toBe(testUserId);
    });

    test("should throw error when trying to change workflow", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      await expect(
        projectService.updateProject(
          testProjectId,
          { workflowId: "new-workflow-id" } as any,
          testUserId
        )
      ).rejects.toThrow(ProjectError);

      try {
        await projectService.updateProject(
          testProjectId,
          { workflowId: "new-workflow-id" } as any,
          testUserId
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectError);
        expect((error as ProjectError).code).toBe(
          ProjectErrorCode.WORKFLOW_IMMUTABLE
        );
      }
    });

    test("should throw error when non-owner tries to update", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();

      await expect(
        projectService.updateProject(
          testProjectId,
          { name: "Hacked Project" },
          otherUserId
        )
      ).rejects.toThrow(ProjectError);
    });
  });

  describe("updateProjectStatus", () => {
    test("should update project status to archived", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const updated = await projectService.updateProjectStatus(
        testProjectId,
        "archived",
        testUserId
      );

      expect(updated.status).toBe("archived");
      expect(updated.statusUpdatedAt).toBeDefined();
      expect(updated.updatedBy).toBe(testUserId);
    });

    test("should update project status to on_hold", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const updated = await projectService.updateProjectStatus(
        testProjectId,
        "on_hold",
        testUserId
      );

      expect(updated.status).toBe("on_hold");
      expect(updated.statusUpdatedAt).toBeDefined();
    });

    test("should update project status to completed", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const updated = await projectService.updateProjectStatus(
        testProjectId,
        "completed",
        testUserId
      );

      expect(updated.status).toBe("completed");
      expect(updated.statusUpdatedAt).toBeDefined();
    });

    test("should restore archived project to active status", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      // Archive the project
      await projectService.updateProjectStatus(
        testProjectId,
        "archived",
        testUserId
      );

      // Restore to active
      const restored = await projectService.updateProjectStatus(
        testProjectId,
        "active",
        testUserId
      );

      expect(restored.status).toBe("active");
      expect(restored.statusUpdatedAt).toBeDefined();
    });

    test("should update statusUpdatedAt timestamp on status change", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const originalTimestamp = created.statusUpdatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await projectService.updateProjectStatus(
        testProjectId,
        "archived",
        testUserId
      );

      expect(updated.statusUpdatedAt).toBeDefined();
      expect(updated.statusUpdatedAt?.getTime()).toBeGreaterThan(
        originalTimestamp?.getTime() || 0
      );
    });

    test("should throw error when non-owner tries to change status", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();

      await expect(
        projectService.updateProjectStatus(
          testProjectId,
          "archived",
          otherUserId
        )
      ).rejects.toThrow(ProjectError);
    });
  });

  describe("checkAccess", () => {
    test("should return true for project owner", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const hasAccess = await projectService.checkAccess(
        testProjectId,
        testUserId
      );

      expect(hasAccess).toBe(true);
    });

    test("should return false for non-member", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();
      const hasAccess = await projectService.checkAccess(
        testProjectId,
        otherUserId
      );

      expect(hasAccess).toBe(false);
    });

    test("should return true for direct member", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      // Create a real member user
      const memberResult = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: `member-${crypto.randomUUID()}@example.com`,
          name: "Member User",
          bio: "",
          passwordHash: null,
        })
        .returning();
      const memberId = memberResult[0].id;

      await projectService.addMember(
        testProjectId,
        { userId: memberId },
        testUserId
      );

      const hasAccess = await projectService.checkAccess(
        testProjectId,
        memberId
      );

      expect(hasAccess).toBe(true);

      // Clean up - delete project members first, then user
      await db
        .delete(projectMembers)
        .where(eq(projectMembers.userId, memberId));
      await db.delete(users).where(eq(users.id, memberId));

      expect(hasAccess).toBe(true);
    });
  });

  describe("checkOwnership", () => {
    test("should return true for project owner", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const isOwner = await projectService.checkOwnership(
        testProjectId,
        testUserId
      );

      expect(isOwner).toBe(true);
    });

    test("should return false for non-owner", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();
      const isOwner = await projectService.checkOwnership(
        testProjectId,
        otherUserId
      );

      expect(isOwner).toBe(false);
    });
  });

  describe("listProjects with status filtering", () => {
    test("should return only active projects by default", async () => {
      // Create active project
      const activeProject = await projectService.createProject(
        {
          name: "Active Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );

      // Create and archive another project
      const archivedProject = await projectService.createProject(
        {
          name: "Archived Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        archivedProject.id,
        "archived",
        testUserId
      );

      // List projects without status filter (should default to active)
      const projects = await projectService.listProjects(testUserId);

      expect(projects.length).toBe(1);
      expect(projects[0].id).toBe(activeProject.id);
      expect(projects[0].status).toBe("active");

      // Clean up
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, activeProject.id));
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, archivedProject.id));
    });

    test("should return archived projects when filtered by archived status", async () => {
      // Create active project
      const activeProject = await projectService.createProject(
        {
          name: "Active Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );

      // Create and archive another project
      const archivedProject = await projectService.createProject(
        {
          name: "Archived Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        archivedProject.id,
        "archived",
        testUserId
      );

      // List archived projects
      const archivedProjects = await projectService.listProjects(
        testUserId,
        "archived"
      );

      expect(archivedProjects.length).toBe(1);
      expect(archivedProjects[0].id).toBe(archivedProject.id);
      expect(archivedProjects[0].status).toBe("archived");

      // Clean up
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, activeProject.id));
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, archivedProject.id));
    });

    test("should return on_hold projects when filtered", async () => {
      const onHoldProject = await projectService.createProject(
        {
          name: "On Hold Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        onHoldProject.id,
        "on_hold",
        testUserId
      );

      const projects = await projectService.listProjects(testUserId, "on_hold");

      expect(projects.length).toBe(1);
      expect(projects[0].status).toBe("on_hold");

      // Clean up
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, onHoldProject.id));
    });

    test("should return completed projects when filtered", async () => {
      const completedProject = await projectService.createProject(
        {
          name: "Completed Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        completedProject.id,
        "completed",
        testUserId
      );

      const projects = await projectService.listProjects(
        testUserId,
        "completed"
      );

      expect(projects.length).toBe(1);
      expect(projects[0].status).toBe("completed");

      // Clean up
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, completedProject.id));
    });

    test("should return all projects when status is null", async () => {
      // Create projects with different statuses
      const activeProject = await projectService.createProject(
        {
          name: "Active Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );

      const archivedProject = await projectService.createProject(
        {
          name: "Archived Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        archivedProject.id,
        "archived",
        testUserId
      );

      const onHoldProject = await projectService.createProject(
        {
          name: "On Hold Project",
          workflowId: testWorkflowId,
        },
        testUserId
      );
      await projectService.updateProjectStatus(
        onHoldProject.id,
        "on_hold",
        testUserId
      );

      // List all projects
      const allProjects = await projectService.listProjects(testUserId, null);

      expect(allProjects.length).toBe(3);
      const statuses = allProjects.map((p) => p.status);
      expect(statuses).toContain("active");
      expect(statuses).toContain("archived");
      expect(statuses).toContain("on_hold");

      // Clean up
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, activeProject.id));
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, archivedProject.id));
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, onHoldProject.id));
    });
  });

  describe("data preservation on status changes", () => {
    test("should preserve all project data when archiving", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        description: "Test Description",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      // Archive the project
      await projectService.updateProjectStatus(
        testProjectId,
        "archived",
        testUserId
      );

      // Retrieve the project
      const archived = await projectService.getProject(
        testProjectId,
        testUserId
      );

      // Verify all data is preserved
      expect(archived).toBeDefined();
      expect(archived?.name).toBe(input.name);
      expect(archived?.description).toBe(input.description);
      expect(archived?.workflowId).toBe(testWorkflowId);
      expect(archived?.ownerId).toBe(testUserId);
      expect(archived?.status).toBe("archived");
    });

    test("should preserve project members when changing status", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      // Create a member user
      const memberResult = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: `member-${crypto.randomUUID()}@example.com`,
          name: "Member User",
          bio: "",
          passwordHash: null,
        })
        .returning();
      const memberId = memberResult[0].id;

      // Add member
      await projectService.addMember(
        testProjectId,
        { userId: memberId },
        testUserId
      );

      // Archive the project
      await projectService.updateProjectStatus(
        testProjectId,
        "archived",
        testUserId
      );

      // Verify member still has access
      const hasAccess = await projectService.checkAccess(
        testProjectId,
        memberId
      );
      expect(hasAccess).toBe(true);

      // Verify members list is preserved
      const members = await projectService.listMembers(
        testProjectId,
        testUserId
      );
      expect(members.length).toBe(1);
      expect(members[0].userId).toBe(memberId);

      // Clean up
      await db
        .delete(projectMembers)
        .where(eq(projectMembers.userId, memberId));
      await db.delete(users).where(eq(users.id, memberId));
    });
  });

  describe("member management", () => {
    test("should add and remove members", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      // Create a real member user
      const memberResult = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: `member-${crypto.randomUUID()}@example.com`,
          name: "Member User 2",
          bio: "",
          passwordHash: null,
        })
        .returning();
      const memberId = memberResult[0].id;

      // Add member
      await projectService.addMember(
        testProjectId,
        { userId: memberId },
        testUserId
      );

      // List members
      const members = await projectService.listMembers(
        testProjectId,
        testUserId
      );
      expect(members.length).toBe(1);
      expect(members[0].userId).toBe(memberId);

      // Remove member
      await projectService.removeMember(
        testProjectId,
        members[0].id,
        testUserId
      );

      // Verify removal
      const membersAfter = await projectService.listMembers(
        testProjectId,
        testUserId
      );
      expect(membersAfter.length).toBe(0);

      // Clean up member user
      await db.delete(users).where(eq(users.id, memberId));
    });

    test("should throw error when non-owner tries to add member", async () => {
      const input: CreateProjectInput = {
        name: "Test Project",
        workflowId: testWorkflowId,
      };

      const created = await projectService.createProject(input, testUserId);
      testProjectId = created.id;

      const otherUserId = crypto.randomUUID();
      const memberId = crypto.randomUUID();

      await expect(
        projectService.addMember(
          testProjectId,
          { userId: memberId },
          otherUserId
        )
      ).rejects.toThrow(ProjectError);
    });
  });
});
