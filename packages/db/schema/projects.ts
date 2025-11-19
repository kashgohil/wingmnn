import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { basicFields } from "./basic";

export const projects = pgTable("projects", {
  ...basicFields,
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: text("project_id").notNull(),
    userId: text("user_id").notNull(),
    isAdmin: boolean("is_admin").default(false),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.userId],
    }),
  ],
);

export const tags = pgTable("tags", {
  ...basicFields,
  name: text("name").notNull(),
  description: text("description").notNull(),
  colorCode: text("color_code").notNull().default("#ffffff"),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
});
