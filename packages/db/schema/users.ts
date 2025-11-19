import crypto from "crypto";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { basicFields } from "./basic";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userGroups = pgTable("user_groups", {
  ...basicFields,
  name: text("name").notNull(),
  description: text("description").notNull(),
  colorCode: text("color_code").notNull().default("#ffffff"),
});

export const userGroupMembers = pgTable(
  "user_group_members",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    groupId: text("group_id")
      .notNull()
      .references(() => userGroups.id),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.userId] }),
    index("idx_user_group_member_user_id").on(t.userId),
  ],
);
