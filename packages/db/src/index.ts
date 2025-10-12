import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool, schema, logger: true });
export type DrizzleDB = typeof db;

// Export seeding functions
export {
  clearDatabase,
  clearWorkflows,
  seedDatabase,
  seedWorkflows,
} from "./seeds";
export * from "./seeds/utils";
