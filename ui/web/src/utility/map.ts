/**
 * @param list list of items
 * @param fn function to loop through list
 * @returns list of modified items (returned by fn)
 */
export function map<T, R>(list: Array<T>, fn: (item: T, index: number) => R) {
  const ans: Array<R> = [];
  for (let index = 0; index < list.length; index++) {
    const value = fn(list[index], index);
    ans.push(value);
  }
  return ans;
}
