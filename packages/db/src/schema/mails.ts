import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { commonFields } from "../constants";
import { usersTable } from "./users";

export const mailsTable = pgTable("emails", {
  ...commonFields,
  gmailId: varchar("gmail_id", { length: 255 }).unique().notNull(),
  threadId: varchar("thread_id", { length: 255 }),
  subject: text("subject"),
  from: text("from"),
  to: text("to"),
  body: text("body"),
  snippet: text("snippet"),
  labelIds: text("label_ids"), // JSON array as text
  date: timestamp("date"),
  userId: integer("user_id").references(() => usersTable.id, {
    onDelete: "no action",
  }),
});

export type Mail = typeof mailsTable.$inferSelect;
export type NewMail = typeof mailsTable.$inferInsert;
export type MailsTable = typeof mailsTable;
