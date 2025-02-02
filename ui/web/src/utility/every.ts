import { forEachArray, forEachObj } from "./forEach";

/**
 * @param list array of items
 * @param fn function to loop through list
 * @returns boolean - true, if all the items return true for fn, false, if one of the item returns false for fn
 */
export function every<T>(
  list: Array<T>,
  fn: (item: T, index: number) => boolean,
): boolean {
  let ans = true;
  forEachArray(list, (item, index) => {
    ans &&= fn(item, index);
  });
  return ans;
}

/**
 * @param object
 * @param fn function to loop through key-value pairs of object
 * @returns boolean - true, if all key-value pairs return true for fn, false, if one key-value pair returns false for fn
 */
export function everyObj<T>(
  object: T,
  fn: (value: T[keyof T], key: keyof T) => boolean,
) {
  let ans = true;
  forEachObj(object, (value, key) => {
    ans &&= fn(value, key);
  });
  return ans;
}
