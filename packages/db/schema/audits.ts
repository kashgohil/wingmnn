import crypto from "crypto";
import { json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditTypeEnum = pgEnum("audit_type", [
  "create",
  "update",
  "delete",
]);

export const audits = pgTable("audits", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  createdAt: timestamp("created_at").defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: auditTypeEnum("type").notNull(),
  oldData: json("old_data"),
  newData: json("new_data"),
  module: text("module").notNull(),
});
