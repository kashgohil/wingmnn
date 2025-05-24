import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";

export const tasksTable = pgTable("tasks", {
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  ...commonFields,
});
