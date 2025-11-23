import crypto from "crypto";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const workflowTypeEnum = pgEnum("workflow_type", ["task", "subtask"]);

export const phaseEnum = pgEnum("phase", [
  "backlog",
  "planning",
  "in_progress",
  "feedback",
  "closed",
]);

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  workflowType: workflowTypeEnum("workflow_type").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workflowStatuses = pgTable(
  "workflow_statuses",
  {
    id: text("id").primaryKey().default(crypto.randomUUID()),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    phase: phaseEnum("phase").notNull(),
    colorCode: text("color_code").notNull().default("#808080"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("workflow_statuses_workflow_id_idx").on(table.workflowId),
    index("workflow_statuses_phase_idx").on(table.phase),
  ]
);
