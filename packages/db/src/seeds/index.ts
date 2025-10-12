import {
  getWorkflowCount,
  printExistingWorkflows,
  validateDatabaseConnection,
  workflowsExist,
} from "./utils";
import { clearWorkflows, seedWorkflows } from "./workflows";

export interface SeedOptions {
  clear?: boolean;
  workflows?: boolean;
  force?: boolean;
}

/**
 * Main seeding function that orchestrates all database seeds
 */
export async function seedDatabase(options: SeedOptions = {}) {
  const { clear = false, workflows = true, force = false } = options;

  console.log("🌱 Starting database seeding process...");
  console.log("Options:", options);

  try {
    // Validate database connection
    console.log("🔌 Validating database connection...");
    const isConnected = await validateDatabaseConnection();
    if (!isConnected) {
      throw new Error(
        "Cannot connect to database. Please check your DATABASE_URL.",
      );
    }

    // Check existing data
    if (workflows && !clear && !force) {
      const hasWorkflows = await workflowsExist();
      if (hasWorkflows) {
        const count = await getWorkflowCount();
        console.log(
          `⚠️  Found ${count} existing workflow(s). Use --force to override or --clear to remove first.`,
        );
        await printExistingWorkflows();
        return;
      }
    }

    // Clear data if requested
    if (clear) {
      console.log("🧹 Clearing existing data...");
      if (workflows) {
        await clearWorkflows();
      }
    }

    // Seed workflows
    if (workflows) {
      await seedWorkflows();
    }

    console.log("🎉 Database seeding completed successfully!");

    // Show final status
    const finalCount = await getWorkflowCount();
    console.log(`📊 Final workflow count: ${finalCount}`);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

/**
 * Clear all seeded data
 */
export async function clearDatabase() {
  console.log("🧹 Clearing all seeded data...");

  try {
    await clearWorkflows();
    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
    throw error;
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  const command = args[0];
  const hasForceFlag = args.includes("--force");
  const hasClearFlag = args.includes("--clear");

  switch (command) {
    case "clear":
      clearDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case "workflows":
      seedDatabase({
        workflows: true,
        force: hasForceFlag,
        clear: hasClearFlag,
      })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case "status":
      printExistingWorkflows()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case "all":
    default:
      seedDatabase({
        force: hasForceFlag,
        clear: hasClearFlag,
      })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
  }
}

export { clearWorkflows, seedWorkflows };
