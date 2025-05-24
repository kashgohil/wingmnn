import { pgTable, varchar } from "drizzle-orm/pg-core";
import { commonFields } from "../constants";

export const teamsTable = pgTable("teams", {
  name: varchar("name", { length: 255 }).notNull(),
  bio: varchar("bio", { length: 255 }).notNull(),
  ...commonFields,
});
