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

type ObjOrArr = Array<unknown> | Object;

function shouldDeepCompare(typ: string) {
  return typ === "[object Object]" || typ === "[object Array]";
}

function getType(value: unknown) {
  return Object.prototype.toString.call(value);
}

/**
 * @param value1 primary value
 * @param value2 secondary value
 * @returns boolean - true, if both are equal, false, if not
 */
export function deepEqual(valueA: unknown, valueB: unknown): boolean {
  const type1 = getType(valueA);
  const type2 = getType(valueB);

  if (type1 === type2 && shouldDeepCompare(type1) && shouldDeepCompare(type2)) {
    const entriesA = Object.entries(valueA as ObjOrArr);
    const entriesB = Object.entries(valueB as ObjOrArr);

    if (entriesA.length !== entriesB.length) return false;

    return entriesA.every(([key, value]) => {
      if (!Object.hasOwn(valueB as ObjOrArr, key)) return false;
      return deepEqual(value, (valueB as TSAny)[key]);
    });
  }

  return Object.is(valueA, valueB);
}
