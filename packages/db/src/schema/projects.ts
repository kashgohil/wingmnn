import { pgEnum, pgTable, varchar, text, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { commonFields } from "../constants";
import { usersTable } from "./users";
import { tasksTable } from "./tasks";

export const ProjectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
  "archived"
]);

export const WorkflowStatusTypeEnum = pgEnum("workflow_status_type", [
  "todo",
  "in_progress",
  "review",
  "testing",
  "done",
  "blocked",
  "cancelled"
]);

export const projectsTable = pgTable("projects", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: ProjectStatusEnum("status").notNull().default("planning"),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  budget: varchar("budget", { length: 100 }),
  priority: integer("priority").default(1), // 1-5 scale
  isArchived: boolean("is_archived").default(false),
  teamId: varchar("team_id", { length: 255 }),
  projectLead: varchar("project_lead", { length: 255 }).references(
    () => usersTable.id,
    { onDelete: "set null" }
  ),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  ...commonFields,
});

export const workflowsTable = pgTable("workflows", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectId: varchar("project_id", { length: 255 }).notNull().references(
    () => projectsTable.id,
    { onDelete: "cascade" }
  ),
  isDefault: boolean("is_default").default(false),
  ...commonFields,
});

export const workflowStatusesTable = pgTable("workflow_statuses", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: WorkflowStatusTypeEnum("type").notNull().default("todo"),
  color: varchar("color", { length: 7 }).default("#6b7280"), // hex color
  order: integer("order").notNull(),
  workflowId: varchar("workflow_id", { length: 255 }).notNull().references(
    () => workflowsTable.id,
    { onDelete: "cascade" }
  ),
  isInitial: boolean("is_initial").default(false),
  isFinal: boolean("is_final").default(false),
  ...commonFields,
});

export const workflowTransitionsTable = pgTable("workflow_transitions", {
  name: varchar("name", { length: 255 }).notNull(),
  fromStatusId: varchar("from_status_id", { length: 255 }).references(
    () => workflowStatusesTable.id,
    { onDelete: "cascade" }
  ),
  toStatusId: varchar("to_status_id", { length: 255 }).notNull().references(
    () => workflowStatusesTable.id,
    { onDelete: "cascade" }
  ),
  workflowId: varchar("workflow_id", { length: 255 }).notNull().references(
    () => workflowsTable.id,
    { onDelete: "cascade" }
  ),
  conditions: jsonb("conditions").$type<Record<string, any>>().default({}),
  ...commonFields,
});

// Relations
export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  projectLead: one(usersTable, {
    fields: [projectsTable.projectLead],
    references: [usersTable.id],
  }),
  workflows: many(workflowsTable),
  tasks: many(tasksTable),
}));

export const workflowsRelations = relations(workflowsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [workflowsTable.projectId],
    references: [projectsTable.id],
  }),
  statuses: many(workflowStatusesTable),
  transitions: many(workflowTransitionsTable),
}));

export const workflowStatusesRelations = relations(workflowStatusesTable, ({ one, many }) => ({
  workflow: one(workflowsTable, {
    fields: [workflowStatusesTable.workflowId],
    references: [workflowsTable.id],
  }),
  tasks: many(tasksTable),
  transitionsFrom: many(workflowTransitionsTable, {
    relationName: "transitionFrom",
  }),
  transitionsTo: many(workflowTransitionsTable, {
    relationName: "transitionTo",
  }),
}));

export const workflowTransitionsRelations = relations(workflowTransitionsTable, ({ one }) => ({
  workflow: one(workflowsTable, {
    fields: [workflowTransitionsTable.workflowId],
    references: [workflowsTable.id],
  }),
  fromStatus: one(workflowStatusesTable, {
    fields: [workflowTransitionsTable.fromStatusId],
    references: [workflowStatusesTable.id],
    relationName: "transitionFrom",
  }),
  toStatus: one(workflowStatusesTable, {
    fields: [workflowTransitionsTable.toStatusId],
    references: [workflowStatusesTable.id],
    relationName: "transitionTo",
  }),
}));

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type ProjectsTableType = typeof projectsTable;

export type Workflow = typeof workflowsTable.$inferSelect;
export type NewWorkflow = typeof workflowsTable.$inferInsert;
export type WorkflowsTableType = typeof workflowsTable;

export type WorkflowStatus = typeof workflowStatusesTable.$inferSelect;
export type NewWorkflowStatus = typeof workflowStatusesTable.$inferInsert;
export type WorkflowStatusesTableType = typeof workflowStatusesTable;

export type WorkflowTransition = typeof workflowTransitionsTable.$inferSelect;
export type NewWorkflowTransition = typeof workflowTransitionsTable.$inferInsert;
export type WorkflowTransitionsTableType = typeof workflowTransitionsTable;