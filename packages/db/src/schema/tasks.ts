import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";

export const tasksTable = pgTable("tasks", {
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  ...commonFields,
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type TasksTableType = typeof tasksTable;
