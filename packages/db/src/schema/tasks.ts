import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { projectsTable, workflowStatusTable } from "./projects";
import { usersTable } from "./users";

export const TaskTypeEnum = pgEnum("task_type", [
  "feature",
  "enhancement",
  "sub_task",
  "task",
  "bug",
  "story",
  "epic",
  "spike",
  "research",
]);

export const TaskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const TaskRelationTypeEnum = pgEnum("task_relation_type", [
  "blocks",
  "is_blocked_by",
  "relates_to",
  "duplicates",
  "is_duplicated_by",
  "follows",
  "precedes",
  "causes",
  "is_caused_by",
]);

export const ChangeTypeEnum = pgEnum("change_type", [
  "created",
  "updated",
  "deleted",
]);

export const tasksTable = pgTable(
  "tasks",
  {
    ...commonFields,

    key: varchar("key", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    content: text("content"),
    type: TaskTypeEnum("type").notNull().default("task"),
    priority: TaskPriorityEnum("priority").notNull().default("medium"),

    // Project and workflow relationship
    projectId: varchar("project_id", { length: 255 })
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 255 }).references(
      () => workflowStatusTable.id,
      { onDelete: "set null" },
    ),

    // Assignment and tracking
    assignedTo: varchar("assigned_to", { length: 255 }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    reporterId: varchar("reporter_id", { length: 255 }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),

    // Hierarchy
    parentTaskId: varchar("parent_task_id", { length: 255 }),

    // Dates
    startDate: timestamp("start_date").defaultNow().notNull(),
    dueDate: timestamp("start_date"),

    // Additional fields
    tags: jsonb("tags").$type<string[]>().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, any>>()
      .default({}),

    // Status flags
    archived: boolean("archived").default(false),

    // files
    attachments: jsonb("attachments").$type<string[]>().default([]),
  },
  (table) => [
    {
      parentTaskRef: foreignKey({
        columns: [table.parentTaskId],
        foreignColumns: [table.id],
      }).onDelete("cascade"),
    },
  ],
);

export const taskRelationsTable = pgTable("task_relations", {
  sourceTaskId: varchar("source_task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  targetTaskId: varchar("target_task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  relationType: TaskRelationTypeEnum("relation_type").notNull(),
  description: text("description"),
  ...commonFields,
});

export const taskCommentsTable = pgTable("task_comments", {
  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  ...commonFields,
});

export const taskHistoryTable = pgTable("task_history", {
  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  field: varchar("field", { length: 255 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  type: ChangeTypeEnum("type").notNull(),
  ...commonFields,
});

// Relations
export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  workflowStatus: one(workflowStatusTable, {
    fields: [tasksTable.status],
    references: [workflowStatusTable.id],
  }),
  assignee: one(usersTable, {
    fields: [tasksTable.assignedTo],
    references: [usersTable.id],
    relationName: "assignedTasks",
  }),
  reporter: one(usersTable, {
    fields: [tasksTable.reporterId],
    references: [usersTable.id],
    relationName: "reportedTasks",
  }),
  parentTask: one(tasksTable, {
    fields: [tasksTable.parentTaskId],
    references: [tasksTable.id],
    relationName: "parentTask",
  }),
  subtasks: many(tasksTable, {
    relationName: "parentTask",
  }),
  sourceRelations: many(taskRelationsTable, {
    relationName: "sourceTask",
  }),
  targetRelations: many(taskRelationsTable, {
    relationName: "targetTask",
  }),
  comments: many(taskCommentsTable),
  history: many(taskHistoryTable),
}));

export const taskRelationsRelations = relations(
  taskRelationsTable,
  ({ one }) => ({
    sourceTask: one(tasksTable, {
      fields: [taskRelationsTable.sourceTaskId],
      references: [tasksTable.id],
      relationName: "sourceTask",
    }),
    targetTask: one(tasksTable, {
      fields: [taskRelationsTable.targetTaskId],
      references: [tasksTable.id],
      relationName: "targetTask",
    }),
  }),
);

export const taskCommentsRelations = relations(
  taskCommentsTable,
  ({ one }) => ({
    task: one(tasksTable, {
      fields: [taskCommentsTable.taskId],
      references: [tasksTable.id],
    }),
  }),
);

export const taskHistoryRelations = relations(taskHistoryTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [taskHistoryTable.taskId],
    references: [tasksTable.id],
  }),
}));

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type TasksTableType = typeof tasksTable;

export type TaskRelation = typeof taskRelationsTable.$inferSelect;
export type NewTaskRelation = typeof taskRelationsTable.$inferInsert;
export type TaskRelationsTableType = typeof taskRelationsTable;

export type TaskComment = typeof taskCommentsTable.$inferSelect;
export type NewTaskComment = typeof taskCommentsTable.$inferInsert;
export type TaskCommentsTableType = typeof taskCommentsTable;

export type TaskHistory = typeof taskHistoryTable.$inferSelect;
export type NewTaskHistory = typeof taskHistoryTable.$inferInsert;
export type TaskHistoryTableType = typeof taskHistoryTable;
