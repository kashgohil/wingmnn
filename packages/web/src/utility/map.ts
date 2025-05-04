/**
 * @param list list of items
 * @param fn function to loop through list
 * @returns list of modified items (returned by fn)
 */
export function map<T, R>(
  list: Array<T>,
  fn: (item: T, index: number) => R,
): Array<R> {
  const ans: Array<R> = [];
  for (let index = 0; index < list.length; index++) {
    const value = fn(list[index], index);
    ans.push(value);
  }
  return ans;
}

export function mapObj<T, R>(
  object: T,
  fn: (value: T[keyof T], key: keyof T) => R,
): Array<R> {
  const ans: Array<R> = [];
  for (const key in object) {
    const value = fn(object[key], key);
    ans.push(value);
  }
  return ans;
}
