import { filter } from "./filter";

/**
 * @param list list of strings
 * @param filterValue value you want to filter out from list
 * @returns filtered out list
 */
export function without(
  list: Array<string>,
  filterValue: string,
): Array<string> {
  return filter(list, (value) => value !== filterValue);
}
