import { eq } from "drizzle-orm";
import { db } from "../index";
import { workflowsTable, workflowStatusTable } from "../schema/projects";

/**
 * Check if any workflows exist in the database
 */
export async function workflowsExist(): Promise<boolean> {
  const workflows = await db.select().from(workflowsTable).limit(1);
  return workflows.length > 0;
}

/**
 * Check if a specific workflow exists by name
 */
export async function workflowExistsByName(name: string): Promise<boolean> {
  const workflows = await db
    .select()
    .from(workflowsTable)
    .where(eq(workflowsTable.name, name))
    .limit(1);
  return workflows.length > 0;
}

/**
 * Get workflow count
 */
export async function getWorkflowCount(): Promise<number> {
  const result = await db.select().from(workflowsTable);
  return result.length;
}

/**
 * Get workflow status count
 */
export async function getWorkflowStatusCount(): Promise<number> {
  const result = await db.select().from(workflowStatusTable);
  return result.length;
}

/**
 * List all existing workflows with their status counts
 */
export async function listExistingWorkflows() {
  const workflows = await db
    .select({
      id: workflowsTable.id,
      name: workflowsTable.name,
      description: workflowsTable.description,
      createdAt: workflowsTable.createdAt,
    })
    .from(workflowsTable)
    .orderBy(workflowsTable.createdAt);

  const workflowsWithCounts = await Promise.all(
    workflows.map(async (workflow) => {
      const statuses = await db
        .select()
        .from(workflowStatusTable)
        .where(eq(workflowStatusTable.workflowId, workflow.id));

      return {
        ...workflow,
        statusCount: statuses.length,
      };
    })
  );

  return workflowsWithCounts;
}

/**
 * Validate database connection and schema
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    await db.select().from(workflowsTable).limit(1);
    return true;
  } catch (error) {
    console.error("Database connection validation failed:", error);
    return false;
  }
}

/**
 * Pretty print existing workflows
 */
export async function printExistingWorkflows() {
  console.log("📋 Existing workflows in database:");

  const workflows = await listExistingWorkflows();

  if (workflows.length === 0) {
    console.log("   No workflows found.");
    return;
  }

  workflows.forEach((workflow, index) => {
    console.log(`   ${index + 1}. ${workflow.name} (${workflow.statusCount} statuses)`);
    if (workflow.description) {
      console.log(`      Description: ${workflow.description}`);
    }
    console.log(`      Created: ${workflow.createdAt.toLocaleDateString()}`);
    console.log("");
  });
}
