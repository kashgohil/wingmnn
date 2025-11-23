import crypto from "crypto";
import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    refreshTokenHash: text("refresh_token_hash").notNull().unique(),
    accessTokenJti: text("access_token_jti").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at")
      .notNull()
      .default(sql`NOW() + INTERVAL '30 days'`),
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    isRevoked: boolean("is_revoked").notNull().default(false),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_refresh_token_hash_idx").on(table.refreshTokenHash),
  ]
);

export const usedRefreshTokens = pgTable("used_refresh_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});
