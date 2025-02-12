import { forEachArray } from "./forEach";

/**
 * @param list list of items
 * @param fn function to loop through list - return true for item you want, return false for item you don't
 * @returns matching item, undefined if no matching item found
 */
export function find<T>(
  list: Array<T>,
  fn: (item: T, index: number) => boolean,
): T | undefined {
  let ans = undefined;

  forEachArray(list, (item, index) => {
    if (fn(item, index)) {
      ans = item;
      return false;
    }
  });

  return ans;
}

/**
 * @param list list of items
 * @param fn function to loop through list - return true for item you want, return false for item you don't
 * @returns index of the item, -1 if no matching item found
 */
export function findIndex<T>(
  list: Array<T>,
  fn: (item: T, index: number) => boolean,
): number {
  let ans = -1;

  forEachArray(list, (item, index) => {
    if (fn(item, index)) {
      ans = index;
      return false;
    }
  });

  return ans;
}
