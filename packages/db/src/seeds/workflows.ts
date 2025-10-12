import { eq } from "drizzle-orm";
import { db } from "../index";
import { workflowsTable, workflowStatusTable } from "../schema/projects";
import { usersTable } from "../schema/users";

interface WorkflowTemplate {
  name: string;
  description: string;
  statuses: {
    name: string;
    description: string;
    phase: "backlog" | "ideation" | "execution" | "feedback" | "closure";
    color: string;
  }[];
}

const defaultWorkflows: WorkflowTemplate[] = [
  {
    name: "Kanban Workflow",
    description: "Simple Kanban workflow for general project management",
    statuses: [
      {
        name: "Backlog",
        description: "Items waiting to be prioritized",
        phase: "backlog",
        color: "#9ca3af",
      },
      {
        name: "To Do",
        description: "Ready to be worked on",
        phase: "ideation",
        color: "#f59e0b",
      },
      {
        name: "In Progress",
        description: "Currently being worked on",
        phase: "execution",
        color: "#3b82f6",
      },
      {
        name: "Review",
        description: "Ready for review and feedback",
        phase: "feedback",
        color: "#8b5cf6",
      },
      {
        name: "Done",
        description: "Completed work",
        phase: "closure",
        color: "#10b981",
      },
    ],
  },
  {
    name: "Software Development Workflow",
    description: "Complete software development lifecycle workflow",
    statuses: [
      {
        name: "Requirements",
        description: "Gathering and documenting requirements",
        phase: "backlog",
        color: "#6b7280",
      },
      {
        name: "Design",
        description: "System design and architecture planning",
        phase: "ideation",
        color: "#f59e0b",
      },
      {
        name: "Development",
        description: "Active coding and implementation",
        phase: "execution",
        color: "#3b82f6",
      },
      {
        name: "Testing",
        description: "Quality assurance and testing",
        phase: "execution",
        color: "#06b6d4",
      },
      {
        name: "Code Review",
        description: "Peer review and code quality check",
        phase: "feedback",
        color: "#8b5cf6",
      },
      {
        name: "Deployment",
        description: "Deploying to production environment",
        phase: "closure",
        color: "#059669",
      },
      {
        name: "Done",
        description: "Feature complete and deployed",
        phase: "closure",
        color: "#10b981",
      },
    ],
  },
  {
    name: "Content Creation Workflow",
    description: "Workflow for content creation and publishing",
    statuses: [
      {
        name: "Ideas",
        description: "Content ideas and concepts",
        phase: "backlog",
        color: "#9ca3af",
      },
      {
        name: "Planning",
        description: "Content planning and research",
        phase: "ideation",
        color: "#f59e0b",
      },
      {
        name: "Writing",
        description: "Content creation in progress",
        phase: "execution",
        color: "#3b82f6",
      },
      {
        name: "Review",
        description: "Content review and editing",
        phase: "feedback",
        color: "#8b5cf6",
      },
      {
        name: "Approved",
        description: "Content approved for publishing",
        phase: "feedback",
        color: "#059669",
      },
      {
        name: "Published",
        description: "Content published and live",
        phase: "closure",
        color: "#10b981",
      },
    ],
  },
  {
    name: "Research & Development",
    description: "R&D workflow for experimental projects",
    statuses: [
      {
        name: "Research",
        description: "Initial research and exploration",
        phase: "backlog",
        color: "#6b7280",
      },
      {
        name: "Hypothesis",
        description: "Forming hypotheses and approach",
        phase: "ideation",
        color: "#f59e0b",
      },
      {
        name: "Experiment",
        description: "Running experiments and prototypes",
        phase: "execution",
        color: "#3b82f6",
      },
      {
        name: "Analysis",
        description: "Analyzing results and data",
        phase: "feedback",
        color: "#8b5cf6",
      },
      {
        name: "Documentation",
        description: "Documenting findings and outcomes",
        phase: "closure",
        color: "#059669",
      },
      {
        name: "Complete",
        description: "Research complete with documented results",
        phase: "closure",
        color: "#10b981",
      },
    ],
  },
  {
    name: "Bug Triage Workflow",
    description: "Workflow for handling and resolving bugs",
    statuses: [
      {
        name: "Reported",
        description: "Bug has been reported",
        phase: "backlog",
        color: "#ef4444",
      },
      {
        name: "Triaged",
        description: "Bug has been assessed and prioritized",
        phase: "ideation",
        color: "#f59e0b",
      },
      {
        name: "Investigating",
        description: "Investigating root cause",
        phase: "execution",
        color: "#3b82f6",
      },
      {
        name: "Fixing",
        description: "Implementing the fix",
        phase: "execution",
        color: "#06b6d4",
      },
      {
        name: "Testing Fix",
        description: "Testing the bug fix",
        phase: "feedback",
        color: "#8b5cf6",
      },
      {
        name: "Resolved",
        description: "Bug has been fixed and tested",
        phase: "closure",
        color: "#10b981",
      },
    ],
  },
];

/**
 * Get or create a system user for seeding operations
 */
async function getSystemUser(): Promise<string> {
  const systemEmail = "system@wingmnn.local";

  // Try to find existing system user
  let systemUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, systemEmail))
    .limit(1);

  if (systemUser.length === 0) {
    // Create system user if it doesn't exist
    console.log("Creating system user for seeding...");
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: "System",
        email: systemEmail,
        authProvider: "email",
        isOnboarded: true,
      })
      .returning();
    return newUser.id;
  }

  return systemUser[0].id;
}

/**
 * Seeds the database with default workflow templates
 */
export async function seedWorkflows() {
  console.log("🌱 Starting workflow seeding...");

  try {
    // Get system user for created_by and updated_by fields
    const systemUserId = await getSystemUser();

    for (const workflowTemplate of defaultWorkflows) {
      console.log(`Creating workflow: ${workflowTemplate.name}`);

      // Insert workflow
      const [workflow] = await db
        .insert(workflowsTable)
        .values({
          name: workflowTemplate.name,
          description: workflowTemplate.description,
          order: workflowTemplate.statuses.map((_, index) => index.toString()),
          createdBy: systemUserId,
          updatedBy: systemUserId,
        })
        .returning();

      // Insert workflow statuses
      const statusInserts = workflowTemplate.statuses.map((status) => ({
        name: status.name,
        description: status.description,
        phase: status.phase,
        color: status.color,
        workflowId: workflow.id,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      }));

      await db.insert(workflowStatusTable).values(statusInserts);

      // Update workflow order with actual status IDs
      const workflowStatuses = await db
        .select()
        .from(workflowStatusTable)
        .where(eq(workflowStatusTable.workflowId, workflow.id))
        .orderBy(workflowStatusTable.createdAt);

      await db
        .update(workflowsTable)
        .set({
          order: workflowStatuses.map((status) => status.id),
          updatedBy: systemUserId,
        })
        .where(eq(workflowsTable.id, workflow.id));

      console.log(
        `✅ Created workflow: ${workflowTemplate.name} with ${workflowTemplate.statuses.length} statuses`,
      );
    }

    console.log("🎉 Workflow seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding workflows:", error);
    throw error;
  }
}

/**
 * Removes all seeded workflows (use with caution!)
 */
export async function clearWorkflows() {
  console.log("🧹 Clearing all workflows...");

  try {
    // Delete all workflow statuses (cascade will handle this, but being explicit)
    await db.delete(workflowStatusTable);

    // Delete all workflows
    await db.delete(workflowsTable);

    console.log("✅ All workflows cleared!");
  } catch (error) {
    console.error("❌ Error clearing workflows:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seedWorkflows()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
