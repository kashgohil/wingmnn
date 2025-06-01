import { SQL } from "drizzle-orm";
import {
  boolean,
  timestamp,
  varchar,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { usersTable } from "./schema/users";

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

export type Key<T extends PgTableWithColumns<TSAny>> = keyof T["_"]["columns"];
export type Value<T extends PgTableWithColumns<TSAny>, K extends Key<T>> =
  | T["_"]["columns"][K]["_"]["data"]
  | SQL;
