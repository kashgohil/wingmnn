import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const TokenTypeEnum = pgEnum("token_type", [
  "access",
  "refresh",
  "verification",
  "google",
]);

export const tokensTable = pgTable("tokens", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => usersTable.id),
  type: TokenTypeEnum("type").notNull(),
  value: varchar("value", { length: 2048 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsed: timestamp("last_used"),
  userAgent: varchar("user_agent", { length: 1024 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  isRevoked: boolean("is_revoked").default(false),

  // Google-specific fields
  googleAccessToken: varchar("google_access_token", { length: 2048 }),
  googleRefreshToken: varchar("google_refresh_token", { length: 2048 }),
  googleTokenExpiry: timestamp("google_token_expiry"),
  googleTokenScopes: varchar("google_token_scopes", { length: 2048 }),
  googleUserInfo: jsonb("google_user_info"),
});

export type Token = typeof tokensTable.$inferSelect;
export type NewToken = typeof tokensTable.$inferInsert;
export type TokensTableType = typeof tokensTable;
