import crypto from "crypto";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at")
    .notNull()
    .default(sql`NOW() + INTERVAL '30 days'`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});
