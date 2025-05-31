import { db } from "@db";
import { Key, Value } from "@db/constants";
import { tokensTable, TokensTableType } from "@db/schema/tokens";
import { eq } from "drizzle-orm";

const query = db.query.tokensTable;

export async function get<K extends Key<TokensTableType>>(
  field: K,
  value: Value<TokensTableType, K>,
) {
  return await query.findFirst({
    where: eq(tokensTable[field], value),
  });
}

export const tokensQuery = {
  findFirst: query.findFirst.bind(query),
  findMany: query.findMany.bind(query),
  get,
  insert: db.insert(tokensTable),
  update: db.update(tokensTable),
};
