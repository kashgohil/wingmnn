import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { basicFields } from "./basic";
import { tags } from "./projects";

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const phaseEnum = pgEnum("phase", [
  "backlog",
  "planning",
  "in_progress",
  "feedback",
  "closed",
]);

export const status = pgTable("status", {
  ...basicFields,
  name: text("name").notNull(),
  description: text("description").notNull(),
  phase: phaseEnum("phase").notNull().default("backlog"),
  colorCode: text("color_code").notNull().default("#ffffff"),
});

export const tasks = pgTable("tasks", {
  ...basicFields,
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status")
    .references(() => status.id)
    .notNull(),
  priority: priorityEnum("priority").notNull().default("low"),
  startDate: timestamp("start_date").defaultNow(),
  dueDate: timestamp("due_date").default(sql`NOW() + INTERVAL '7 days'`),
});

export const taskTags = pgTable(
  "task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [
    primaryKey({ columns: [t.taskId, t.tagId] }),
    index("idx_task_tags_tag_id").on(t.tagId),
  ],
);
