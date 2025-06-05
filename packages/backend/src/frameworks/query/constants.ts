// filterUtils.ts
import { SQL } from "drizzle-orm";
import { TableConfig, type PgColumn as Column } from "drizzle-orm/pg-core";

export enum FilterType {
  EQ = "eq",
  NE = "ne",
  GT = "gt",
  LT = "lt",
  GTE = "gte",
  LTE = "lte",
  IN_ARRAY = "inArray",
  NOT_IN_ARRAY = "notInArray",
  IS_NULL = "isNull",
  IS_NOT_NULL = "isNotNull",
  LIKE = "like",
  NOT_LIKE = "notLike",
  ILIKE = "ilike",
  NOT_ILIKE = "notIlike",
  AND = "and",
  OR = "or",
}

// Helper types for structuring the FilterOperation discriminated union
type ValuePayload<TCol extends Column> = { value: TCol["_"]["data"] | SQL };
type ArrayValuePayload<TCol extends Column> = {
  value: Array<TCol["_"]["data"]> | SQL; // Drizzle's inArray also accepts SQL
};
type StringValuePayload = { value: string | SQL }; // For LIKE, ILIKE, etc.

// Discriminated union for filter operations
// TColumn is the specific type of the Drizzle column being filtered
export type FilterOperation<TColumn extends Column> =
  | ((
      | ({ type: FilterType.EQ } & ValuePayload<TColumn>)
      | ({ type: FilterType.NE } & ValuePayload<TColumn>)
      | ({ type: FilterType.GT } & ValuePayload<TColumn>)
      | ({ type: FilterType.LT } & ValuePayload<TColumn>)
      | ({ type: FilterType.GTE } & ValuePayload<TColumn>)
      | ({ type: FilterType.LTE } & ValuePayload<TColumn>)
      | ({ type: FilterType.IN_ARRAY } & ArrayValuePayload<TColumn>)
      | ({ type: FilterType.NOT_IN_ARRAY } & ArrayValuePayload<TColumn>)
      | { type: FilterType.IS_NULL } // No payload
      | { type: FilterType.IS_NOT_NULL } // No payload
      // Conditional part: string-specific operations are only allowed if TColumn's data type is string
      | (TColumn["_"]["data"] extends string
          ? // If TColumn's JS data type is string, allow these operations:
            | ({ type: FilterType.LIKE } & StringValuePayload)
              | ({ type: FilterType.NOT_LIKE } & StringValuePayload)
              | ({ type: FilterType.ILIKE } & StringValuePayload)
              | ({ type: FilterType.NOT_ILIKE } & StringValuePayload)
          : // Otherwise, these operations are typed as `never`, effectively disallowing them
            never)
    ) & { field: string })
  | ({ type: FilterType.AND } & { filters: Array<FilterOperation<TColumn>> }) // No payload
  | ({ type: FilterType.OR } & { filters: Array<FilterOperation<TColumn>> }); // No payload;

export type Condition<
  TConf extends TableConfig,
  K extends keyof TConf["columns"],
> = FilterOperation<TConf["columns"][K]>;
