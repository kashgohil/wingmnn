import { sql } from "drizzle-orm";
import {
	check,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { basicFields } from "./basic";
import { priorityEnum } from "./tasks";
import { userGroups, users } from "./users";
import { workflows } from "./workflows";

export const projectStatusEnum = pgEnum("project_status", [
	"active",
	"archived",
	"on_hold",
	"completed",
]);

export const projects = pgTable("projects", {
	...basicFields,
	name: text("name").notNull(),
	description: text("description"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => users.id),
	workflowId: text("workflow_id")
		.notNull()
		.references(() => workflows.id),
	status: projectStatusEnum("status").notNull().default("active"),
	statusUpdatedAt: timestamp("status_updated_at").defaultNow(),
	key: text("key"),
	startDate: timestamp("start_date"),
	endDate: timestamp("end_date"),
	priority: priorityEnum("priority").default("medium"),
	category: text("category"),
	settings: jsonb("settings").$type<{
		enableTimeTracking?: boolean;
		enableNotifications?: boolean;
		selectedView?: string;
	}>(),
});

export const projectMembers = pgTable(
	"project_members",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		projectId: text("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: text("user_id").references(() => users.id),
		userGroupId: text("user_group_id").references(() => userGroups.id),
		addedBy: text("added_by")
			.notNull()
			.references(() => users.id),
		addedAt: timestamp("added_at").defaultNow(),
	},
	(table) => [
		check(
			"member_type_check",
			sql`(user_id IS NOT NULL AND user_group_id IS NULL) OR (user_id IS NULL AND user_group_id IS NOT NULL)`,
		),
		index("project_members_project_id_idx").on(table.projectId),
		index("project_members_user_id_idx").on(table.userId),
		index("project_members_user_group_id_idx").on(table.userGroupId),
	],
);

export const tags = pgTable("tags", {
	...basicFields,
	name: text("name").notNull(),
	description: text("description"),
	colorCode: text("color_code").notNull().default("#ffffff"),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
});
