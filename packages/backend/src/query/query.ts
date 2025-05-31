import { DrizzleDB } from "@db";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { Condition } from "./constants";
import { createFilter } from "./filter";

export function Query<
  TConf extends TableConfig,
  K extends keyof TConf["columns"],
>(db: DrizzleDB, table: PgTableWithColumns<TConf>) {
  function get(condition: Condition<TConf, K>) {
    const query = createFilter(table, condition);
    return db
      .select()
      .from(table as TSAny)
      .where(query)
      .limit(1);
  }

  function getAll(condition: Condition<TConf, K>) {
    const query = createFilter(table, condition);
    return db
      .select()
      .from(table as TSAny)
      .where(query);
  }

  return {
    get,
    getAll,
  };
}
