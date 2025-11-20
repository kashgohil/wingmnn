import crypto from "crypto";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { basicFields } from "./basic";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
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
  ]
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: text("id").primaryKey().default(crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: timestamp("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
    index("oauth_user_id_idx").on(table.userId),
  ]
);
