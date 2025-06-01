import { pgTable, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";

export const projectsTable = pgTable("projects", {
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  ...commonFields,
});

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type ProjectsTableType = typeof projectsTable;
