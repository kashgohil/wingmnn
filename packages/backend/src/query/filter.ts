import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notIlike,
  notInArray,
  notLike,
  or,
  SQL,
} from "drizzle-orm";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { map } from "utils";
import { FilterOperation, FilterType } from "./constants";

export function createFilter<
  TConf extends TableConfig,
  K extends keyof TConf["columns"],
>(
  table: PgTableWithColumns<TConf>,
  operation: FilterOperation<TConf["columns"][K]>,
): SQL | undefined {
  switch (operation.type) {
    case FilterType.GT:
      return gt(table[operation.field], operation.value);
    case FilterType.LT:
      return lt(table[operation.field], operation.value);
    case FilterType.GTE:
      return gte(table[operation.field], operation.value);
    case FilterType.LTE:
      return lte(table[operation.field], operation.value);
    case FilterType.EQ:
      return eq(table[operation.field], operation.value);
    case FilterType.ILIKE:
      return ilike(table[operation.field], operation.value);
    case FilterType.IN_ARRAY:
      return inArray(table[operation.field], operation.value);
    case FilterType.IS_NOT_NULL:
      return isNotNull(table[operation.field]);
    case FilterType.IS_NULL:
      return isNull(table[operation.field]);
    case FilterType.LIKE:
      return like(table[operation.field], operation.value);
    case FilterType.NOT_LIKE:
      return notLike(table[operation.field], operation.value);
    case FilterType.NOT_ILIKE:
      return notIlike(table[operation.field], operation.value);
    case FilterType.NE:
      return ne(table[operation.field], operation.value);
    case FilterType.NOT_IN_ARRAY:
      return notInArray(table[operation.field], operation.value);
    case FilterType.AND:
      return and(
        ...map(operation.filters, (filter) =>
          createFilter(table, filter),
        ).filter(Boolean),
      );
    case FilterType.OR:
      return or(
        ...map(operation.filters, (filter) =>
          createFilter(table, filter),
        ).filter(Boolean),
      );
    default:
      console.warn("unhandled filter operation: ", operation);
      return undefined;
  }
}
