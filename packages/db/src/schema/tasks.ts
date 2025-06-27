import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { projectsTable, workflowStatusesTable } from "./projects";
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
    workflowStatusId: varchar("workflow_status_id", { length: 255 }).references(
      () => workflowStatusesTable.id,
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

    // Time tracking
    originalEstimate: integer("original_estimate"), // in minutes
    remainingEstimate: integer("remaining_estimate"), // in minutes
    timeSpent: integer("time_spent").default(0), // in minutes

    // Dates
    startDate: varchar("start_date", { length: 50 }),
    dueDate: varchar("due_date", { length: 50 }),

    // Additional fields
    storyPoints: integer("story_points"),
    tags: jsonb("tags").$type<string[]>().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, any>>()
      .default({}),

    // Status flags
    isArchived: boolean("is_archived").default(false),
  },
  (table) => [
    {
      parentTaskRef: foreignKey({
        columns: [table.parentTaskId],
        foreignColumns: [table.id],
        name: "tasks_parent_task_fk",
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
  isInternal: boolean("is_internal").default(false),
  ...commonFields,
});

export const taskAttachmentsTable = pgTable("task_attachments", {
  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 1024 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 255 }),
  ...commonFields,
});

export const taskHistoryTable = pgTable("task_history", {
  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  field: varchar("field", { length: 255 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changeDescription: text("change_description"),
  ...commonFields,
});

// Relations
export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  workflowStatus: one(workflowStatusesTable, {
    fields: [tasksTable.workflowStatusId],
    references: [workflowStatusesTable.id],
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
  attachments: many(taskAttachmentsTable),
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

export const taskAttachmentsRelations = relations(
  taskAttachmentsTable,
  ({ one }) => ({
    task: one(tasksTable, {
      fields: [taskAttachmentsTable.taskId],
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

export type TaskAttachment = typeof taskAttachmentsTable.$inferSelect;
export type NewTaskAttachment = typeof taskAttachmentsTable.$inferInsert;
export type TaskAttachmentsTableType = typeof taskAttachmentsTable;

export type TaskHistory = typeof taskHistoryTable.$inferSelect;
export type NewTaskHistory = typeof taskHistoryTable.$inferInsert;
export type TaskHistoryTableType = typeof taskHistoryTable;
