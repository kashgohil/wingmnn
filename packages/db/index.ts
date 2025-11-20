import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool, schema });

// Re-export commonly used drizzle-orm functions
export { and, eq, or, sql } from "drizzle-orm";

// Re-export schema tables
export { audits } from "./schema/audits";
export { projectMembers, projects, tags } from "./schema/projects";
export { sessions, usedRefreshTokens } from "./schema/sessions";
export { status, tasks, taskTags } from "./schema/tasks";
export {
  oauthAccounts,
  userGroupMembers,
  userGroups,
  users,
} from "./schema/users";

// Re-export schema and enums
export { schema } from "./schema";
