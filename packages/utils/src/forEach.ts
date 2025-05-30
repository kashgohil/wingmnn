/**
 * @param list array of items
 * @param fn function to loop through list - if fn returns false for any item, loop breaks
 * @returns void
 */
export function forEach<T>(
  list: Array<T>,
  fn: (item: T, index: number) => void | boolean,
) {
  for (let index = 0; index < list.length; index++) {
    if (fn(list[index], index) === false) return;
  }
}

/**
 * @param list an object
 * @param fn function to loop through each key-value pair of object - if fn returns false for any key-value pair, loop breaks
 * @returns void
 */
export function forEachObj<T>(
  object: T,
  fn: (value: T[keyof T], key: keyof T) => void | boolean,
) {
  for (const key in object) {
    if (fn(object[key], key) === false) return;
  }
}
