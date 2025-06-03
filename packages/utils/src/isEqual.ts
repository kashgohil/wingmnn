import { forEachObj } from "./forEach";
import { isEmpty } from "./isEmpty";
import { isPrimitive } from "./isPrimitive";

/**
 * @param value1 primary value
 * @param value2 secondary value
 * @returns boolean - true, if both are equal, false, if not
 */
export function isEqual(value1: TSAny, value2: TSAny): boolean {
  if (value1 === value2) return true;
  if (isEmpty(value1) || isEmpty(value2)) return false;
  if (Object.keys(value1).length !== Object.keys(value2).length) return false;

  let ans = true;

  forEachObj(value1, (value, key) => {
    if (!value2[key]) {
      ans = false;
      return false;
    }

    if (isPrimitive(value) && value !== value2[key]) {
      ans = false;
      return false;
    }

    ans = isEqual(value, value2[key]);

    if (!ans) return false;
  });

  return ans;
}
