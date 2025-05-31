import { db } from "@db";
import { Key, Value } from "@db/constants";
import { User, usersTable, UsersTableType } from "@db/schema/users";
import { eq } from "drizzle-orm";
import { stripEmptyValues } from "utils";

const query = db.query.usersTable;

function sanitizeUser(user: User) {
  return stripEmptyValues({
    ...user,
    password: null,
    googleId: null,
    authProvider: null,
  });
}

export async function get<K extends Key<UsersTableType>>(
  field: K,
  value: Value<UsersTableType, K>,
) {
  const user = await query.findFirst({
    where: eq(usersTable[field], value),
  });

  if (user) return sanitizeUser(user);
  return null;
}

export const userQuery = {
  findFirst: query.findFirst.bind(query),
  findMany: query.findMany.bind(query),
  get,
  insert: db.insert(usersTable),
  update: db.update(usersTable),
};
