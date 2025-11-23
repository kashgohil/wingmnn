import crypto from "crypto";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { basicFields } from "./basic";
import { projects, tags } from "./projects";
import { users } from "./users";
import { workflowStatuses } from "./workflows";

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const relatedEntityTypeEnum = pgEnum("related_entity_type", [
  "task",
  "subtask",
]);

export const taskLinkTypeEnum = pgEnum("task_link_type", [
  "blocks",
  "blocked_by",
  "depends_on",
  "dependency_of",
  "relates_to",
  "duplicates",
  "duplicated_by",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "create",
  "update",
  "delete",
  "status_change",
  "assignment_change",
  "comment_added",
  "attachment_added",
  "member_added",
  "member_removed",
]);

export const tasks = pgTable(
  "tasks",
  {
    ...basicFields,
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id")
      .notNull()
      .references(() => workflowStatuses.id),
    priority: priorityEnum("priority").notNull().default("medium"),
    assignedTo: text("assigned_to").references(() => users.id),
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),
    estimatedHours: integer("estimated_hours"),
    estimatedPoints: integer("estimated_points"),
    progress: integer("progress").default(0),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_status_id_idx").on(table.statusId),
    index("tasks_assigned_to_idx").on(table.assignedTo),
    index("tasks_deleted_at_idx").on(table.deletedAt),
  ]
);

export const subtasks = pgTable(
  "subtasks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id")
      .notNull()
      .references(() => workflowStatuses.id),
    priority: priorityEnum("priority").notNull().default("medium"),
    assignedTo: text("assigned_to").references(() => users.id),
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),
    progress: integer("progress").default(0),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("subtasks_task_id_idx").on(table.taskId),
    index("subtasks_status_id_idx").on(table.statusId),
    index("subtasks_assigned_to_idx").on(table.assignedTo),
    index("subtasks_deleted_at_idx").on(table.deletedAt),
  ]
);

export const taskLinks = pgTable(
  "task_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceTaskId: text("source_task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    targetTaskId: text("target_task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    linkType: taskLinkTypeEnum("link_type").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("task_links_source_task_id_idx").on(table.sourceTaskId),
    index("task_links_target_task_id_idx").on(table.targetTaskId),
  ]
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type").notNull(),
    relatedEntityId: text("related_entity_id").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    date: timestamp("date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("time_entries_user_id_idx").on(table.userId),
    index("time_entries_related_entity_idx").on(
      table.relatedEntityType,
      table.relatedEntityId
    ),
    index("time_entries_date_idx").on(table.date),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type").notNull(),
    relatedEntityId: text("related_entity_id").notNull(),
    parentCommentId: text("parent_comment_id").references(
      (): any => comments.id,
      {
        onDelete: "cascade",
      }
    ),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    editedAt: timestamp("edited_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("comments_related_entity_idx").on(
      table.relatedEntityType,
      table.relatedEntityId
    ),
    index("comments_parent_comment_id_idx").on(table.parentCommentId),
    index("comments_author_id_idx").on(table.authorId),
  ]
);

export const attachments = pgTable(
  "attachments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type").notNull(),
    relatedEntityId: text("related_entity_id").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("attachments_related_entity_idx").on(
      table.relatedEntityType,
      table.relatedEntityId
    ),
    index("attachments_uploaded_by_idx").on(table.uploadedBy),
  ]
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").references(() => projects.id),
    taskId: text("task_id").references(() => tasks.id),
    subtaskId: text("subtask_id").references(() => subtasks.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    activityType: activityTypeEnum("activity_type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    changes: jsonb("changes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("activity_logs_project_id_idx").on(table.projectId),
    index("activity_logs_task_id_idx").on(table.taskId),
    index("activity_logs_subtask_id_idx").on(table.subtaskId),
    index("activity_logs_user_id_idx").on(table.userId),
    index("activity_logs_entity_idx").on(table.entityType, table.entityId),
    index("activity_logs_created_at_idx").on(table.createdAt),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
    relatedEntityId: text("related_entity_id"),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_project_id_idx").on(table.projectId),
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export const taskTags = pgTable(
  "task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.taskId, t.tagId] }),
    index("idx_task_tags_tag_id").on(t.tagId),
  ]
);
