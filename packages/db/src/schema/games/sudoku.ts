import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { commonFields } from "../../constants";
import { usersTable } from "../users";

export const DifficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const sudokuTable = pgTable("sudoku", {
  ...commonFields,

  name: text("name").default(""),
  size: integer("size").notNull().default(9),
  difficulty: DifficultyEnum("difficulty").notNull().default("easy"),
  puzzle: jsonb("puzzle").$type<number[][]>().notNull(),
  solution: jsonb("solution").$type<number[][]>().notNull(),
  attempts: jsonb("attempts").$type<number[][][]>().notNull().default([]),
});

export const sudokuRelations = relations(sudokuTable, ({ one }) => ({
  createdBy: one(usersTable, {
    fields: [sudokuTable.createdBy],
    references: [usersTable.id],
  }),

  updatedBy: one(usersTable, {
    fields: [sudokuTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export type Sudoku = typeof sudokuTable.$inferSelect;
export type NewSudoku = typeof sudokuTable.$inferInsert;
export type SudokuTableType = typeof sudokuTable;
