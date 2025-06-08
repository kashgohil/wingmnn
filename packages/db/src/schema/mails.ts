import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { usersTable } from "./users";

export const mailsTable = pgTable("emails", {
  ...commonFields,
  gmailId: varchar("gmail_id", { length: 255 }).unique().notNull(),
  threadId: varchar("thread_id", { length: 255 }),
  subject: text("subject"),
  from: text("from"),
  to: text("to"),
  cc: text("cc")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  bcc: text("bcc")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  body: text("body"),
  snippet: text("snippet"),
  labelIds: text("label_ids")
    .array()
    .default(sql`ARRAY[]::text[]`),
  date: timestamp("date"),
  userId: varchar("user_id", { length: 255 }).references(() => usersTable.id, {
    onDelete: "no action",
  }),
});

export type Mail = typeof mailsTable.$inferSelect;
export type NewMail = typeof mailsTable.$inferInsert;
export type MailsTableType = typeof mailsTable;
