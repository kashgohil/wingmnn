import { forEach, forEachObj } from "./forEach";

/**
 * @param list array of items
 * @param fn function to loop through list
 * @returns boolean - true, if one of items return true for fn, false, if all items return false for fn
 */
export function some<T>(
  list: Array<T>,
  fn: (item: T, index: number) => boolean,
): boolean {
  let ans = false;
  forEach(list, (item, index) => {
    if (fn(item, index)) {
      ans = true;
      return false;
    }
  });
  return ans;
}

/**
 * @param object
 * @param fn function to loop through key-value pairs of object
 * @returns boolean - true, if one key-value pair return true for fn, false, if all key-value pairs return false for fn
 */
export function someObj<T>(
  object: T,
  fn: (value: T[keyof T], key: keyof T) => boolean,
) {
  let ans = false;
  forEachObj(object, (value, key) => {
    if (fn(value, key)) {
      ans = true;
      return false;
    }
  });
  return ans;
}
