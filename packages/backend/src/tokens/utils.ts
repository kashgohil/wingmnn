import { db, Key, tokensTable, TokensTableType, Value } from "db";
import { eq } from "drizzle-orm";
import { tryCatchAsync } from "utils";

const query = db.query.tokensTable;

export const tokensQuery = {
  findFirst: query.findFirst.bind(query),
  findMany: query.findMany.bind(query),
  get,
  insert: db.insert(tokensTable),
  update: db.update(tokensTable),
};

export async function get<K extends Key<TokensTableType>>(
  field: K,
  value: Value<TokensTableType, K>,
) {
  const { result: token, error } = await tryCatchAsync(
    tokensQuery.findFirst({
      where: eq(tokensTable[field], value),
    }),
  );

  if (error) throw error;
  if (!token) throw new Error("Token not found");
  return token;
}
