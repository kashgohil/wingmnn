import crypto from "crypto";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users } from "./schema/users";
import { workflows, workflowStatuses } from "./schema/workflows";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedWorkflows() {
  console.log("Seeding predefined workflow templates...");

  // Get or create a system user for templates
  let systemUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "system@workflow-templates.internal"))
    .limit(1);

  let systemUserId: string;

  if (systemUser.length === 0) {
    console.log("Creating system user for workflow templates...");
    const newSystemUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: "System",
        bio: "System user for workflow templates",
        email: "system@workflow-templates.internal",
      })
      .returning();
    systemUserId = newSystemUser[0]!.id;
    console.log("✓ System user created");
  } else {
    systemUserId = systemUser[0]!.id;
    console.log("✓ Using existing system user");
  }

  try {
    // Basic Workflow Template
    const basicWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: basicWorkflowId,
      name: "Basic",
      description:
        "Simple workflow with three statuses: To Do, In Progress, Done",
      workflowType: "task",
      createdBy: systemUserId,
      isTemplate: true,
    });

    await db.insert(workflowStatuses).values([
      {
        id: crypto.randomUUID(),
        workflowId: basicWorkflowId,
        name: "To Do",
        description: "Tasks that need to be started",
        phase: "backlog",
        colorCode: "#6B7280",
        position: 1,
      },
      {
        id: crypto.randomUUID(),
        workflowId: basicWorkflowId,
        name: "In Progress",
        description: "Tasks currently being worked on",
        phase: "in_progress",
        colorCode: "#3B82F6",
        position: 2,
      },
      {
        id: crypto.randomUUID(),
        workflowId: basicWorkflowId,
        name: "Done",
        description: "Completed tasks",
        phase: "closed",
        colorCode: "#10B981",
        position: 3,
      },
    ]);

    console.log("✓ Basic workflow template created");

    // Agile Workflow Template
    const agileWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: agileWorkflowId,
      name: "Agile",
      description:
        "Agile workflow with backlog, ready, in progress, review, and done",
      workflowType: "task",
      createdBy: systemUserId,
      isTemplate: true,
    });

    await db.insert(workflowStatuses).values([
      {
        id: crypto.randomUUID(),
        workflowId: agileWorkflowId,
        name: "Backlog",
        description: "Tasks in the backlog",
        phase: "backlog",
        colorCode: "#9CA3AF",
        position: 1,
      },
      {
        id: crypto.randomUUID(),
        workflowId: agileWorkflowId,
        name: "Ready",
        description: "Tasks ready to be worked on",
        phase: "planning",
        colorCode: "#8B5CF6",
        position: 2,
      },
      {
        id: crypto.randomUUID(),
        workflowId: agileWorkflowId,
        name: "In Progress",
        description: "Tasks currently being worked on",
        phase: "in_progress",
        colorCode: "#3B82F6",
        position: 3,
      },
      {
        id: crypto.randomUUID(),
        workflowId: agileWorkflowId,
        name: "Review",
        description: "Tasks under review",
        phase: "feedback",
        colorCode: "#F59E0B",
        position: 4,
      },
      {
        id: crypto.randomUUID(),
        workflowId: agileWorkflowId,
        name: "Done",
        description: "Completed tasks",
        phase: "closed",
        colorCode: "#10B981",
        position: 5,
      },
    ]);

    console.log("✓ Agile workflow template created");

    // Kanban Workflow Template
    const kanbanWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: kanbanWorkflowId,
      name: "Kanban",
      description: "Kanban workflow with backlog, to do, doing, and done",
      workflowType: "task",
      createdBy: systemUserId,
      isTemplate: true,
    });

    await db.insert(workflowStatuses).values([
      {
        id: crypto.randomUUID(),
        workflowId: kanbanWorkflowId,
        name: "Backlog",
        description: "Tasks in the backlog",
        phase: "backlog",
        colorCode: "#9CA3AF",
        position: 1,
      },
      {
        id: crypto.randomUUID(),
        workflowId: kanbanWorkflowId,
        name: "To Do",
        description: "Tasks ready to be started",
        phase: "planning",
        colorCode: "#6B7280",
        position: 2,
      },
      {
        id: crypto.randomUUID(),
        workflowId: kanbanWorkflowId,
        name: "Doing",
        description: "Tasks currently being worked on",
        phase: "in_progress",
        colorCode: "#3B82F6",
        position: 3,
      },
      {
        id: crypto.randomUUID(),
        workflowId: kanbanWorkflowId,
        name: "Done",
        description: "Completed tasks",
        phase: "closed",
        colorCode: "#10B981",
        position: 4,
      },
    ]);

    console.log("✓ Kanban workflow template created");

    // Subtask Workflow Template
    const subtaskWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: subtaskWorkflowId,
      name: "Subtask Workflow",
      description: "Default workflow for subtasks",
      workflowType: "subtask",
      createdBy: systemUserId,
      isTemplate: true,
    });

    await db.insert(workflowStatuses).values([
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "To Do",
        description: "Subtasks that need to be started",
        phase: "backlog",
        colorCode: "#6B7280",
        position: 1,
      },
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "In Progress",
        description: "Subtasks currently being worked on",
        phase: "in_progress",
        colorCode: "#3B82F6",
        position: 2,
      },
      {
        id: crypto.randomUUID(),
        workflowId: subtaskWorkflowId,
        name: "Done",
        description: "Completed subtasks",
        phase: "closed",
        colorCode: "#10B981",
        position: 3,
      },
    ]);

    console.log("✓ Subtask workflow template created");

    console.log("\n✅ All workflow templates seeded successfully!");
  } catch (error) {
    console.error("Error seeding workflows:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedWorkflows();
