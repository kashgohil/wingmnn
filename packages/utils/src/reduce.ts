import { isEmpty } from "./isEmpty";

/**
 * @param array list of items
 * @param reducer function to loop through list
 * @returns reduced value
 */
export function reduce<T, U>(
  array: Array<T>,
  reducer: (acc: U, item: T, index: number) => U,
  initialValue: U,
): U {
  if (isEmpty(array)) return array as unknown as U;
  let result = initialValue;
  for (let index = 0; index < array.length; index++) {
    result = reducer(result, array[index], index);
  }
  return result;
}

export function reduceObj<T, U>(
  object: T,
  reducer: (acc: U, item: T[keyof T], key: keyof T) => U,
  initialValue: U,
): U {
  if (isEmpty(object)) return object as unknown as U;
  let result = initialValue;
  for (const key in object) {
    result = reducer(result, object[key], key);
  }
  return result;
}
