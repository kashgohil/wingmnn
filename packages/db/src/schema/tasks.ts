import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { usersTable } from "./users";

export const TaskTypeEnum = pgEnum("task_type", [
  "feature",
  "enhancement",
  "sub_task",
  "task",
  "bug",
  "story",
]);

export const tasksTable = pgTable("tasks", {
  key: varchar("key", { length: 255 }).notNull(),
  title: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: TaskTypeEnum("type").notNull().default("task"),
  assignedTo: varchar("assigned_to", { length: 255 }).references(
    () => usersTable.id,
    {
      onDelete: "no action",
    },
  ),
  status: varchar("status", { length: 255 }).notNull(),
  ...commonFields,
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type TasksTableType = typeof tasksTable;
