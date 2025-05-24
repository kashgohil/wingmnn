import { usersTable } from "@schema/users";
import { boolean, timestamp, varchar } from "drizzle-orm/pg-core";

export const commonFields = {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  createdBy: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "no action" }),
  updatedBy: varchar("updated_by", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "no action" }),

  deleted: boolean("deleted").default(false).notNull(),
};
