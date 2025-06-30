import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { tasksTable } from "./tasks";
import { usersTable } from "./users";

export const ProjectStatusEnum = pgEnum("project_status", [
  "active",
  "on_hold",
  "completed",
  "cancelled",
  "archived",
]);

export const WorkflowPhaseEnum = pgEnum("workflow_phase", [
  "backlog",
  "ideation",
  "execution",
  "feedback",
  "closure",
]);

export const projectsTable = pgTable("projects", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: ProjectStatusEnum("status").notNull().default("active"),
  projectLead: varchar("project_lead", { length: 255 }).references(
    () => usersTable.id,
    { onDelete: "set null" },
  ),
  workflowId: varchar("workflow_id", { length: 255 }).references(
    () => workflowsTable.id,
    { onDelete: "set null" },
  ),
  key: varchar("key", { length: 255 }).notNull().default("KEY"),
  ...commonFields,
});

export const workflowsTable = pgTable("workflows", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  order: jsonb("order").$type<string[]>().notNull().default([]),
  ...commonFields,
});

export const workflowStatusTable = pgTable("workflow_status", {
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  phase: WorkflowPhaseEnum("phase").notNull().default("backlog"),
  color: varchar("color", { length: 7 }).default("#6b7280"),
  workflowId: varchar("workflow_id", { length: 255 })
    .notNull()
    .references(() => workflowsTable.id, { onDelete: "cascade" }),
  ...commonFields,
});

// Relations
export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  projectLead: one(usersTable, {
    fields: [projectsTable.projectLead],
    references: [usersTable.id],
  }),
  workflow: one(workflowsTable, {
    fields: [projectsTable.workflowId],
    references: [workflowsTable.id],
  }),
  tasks: many(tasksTable),
}));

export const workflowsRelations = relations(workflowsTable, ({ many }) => ({
  statuses: many(workflowStatusTable),
}));

export const workflowStatusRelations = relations(
  workflowStatusTable,
  ({ one, many }) => ({
    workflow: one(workflowsTable, {
      fields: [workflowStatusTable.workflowId],
      references: [workflowsTable.id],
    }),
    tasks: many(tasksTable),
  }),
);

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type ProjectsTableType = typeof projectsTable;

export type Workflow = typeof workflowsTable.$inferSelect;
export type NewWorkflow = typeof workflowsTable.$inferInsert;
export type WorkflowsTableType = typeof workflowsTable;

export type WorkflowStatus = typeof workflowStatusTable.$inferSelect;
export type NewWorkflowStatus = typeof workflowStatusTable.$inferInsert;
export type WorkflowStatusesTableType = typeof workflowStatusTable;
