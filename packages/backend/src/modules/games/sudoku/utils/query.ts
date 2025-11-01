import {
  and,
  db,
  eq,
  Key,
  sudokuTable,
  SudokuTableType,
  Value,
} from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";

// Projects Query Utilities
const query = db.query.sudokuTable;

export const sudokuQuery = {
  findFirst: query.findFirst.bind(query),
  findMany: query.findMany.bind(query),
  get: getSudokuGame,
  insert: db.insert(sudokuTable),
  update: db.update(sudokuTable),
  delete: db.delete(sudokuTable),
};

async function getSudokuGame(
  key: Key<SudokuTableType>,
  value: Value<SudokuTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.sudokuTable.findFirst({
      where: and(eq(sudokuTable[key], value), eq(sudokuTable.deleted, false)),
    }),
  );

  if (error) throw error;
  return result;
}
