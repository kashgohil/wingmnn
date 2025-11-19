import crypto from "crypto";
import { boolean, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const basicFields = {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  deleted: boolean("deleted").default(false),
  createdBy: text("created_by")
    .references(() => users.id)
    .notNull(),
  updatedBy: text("updated_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};
