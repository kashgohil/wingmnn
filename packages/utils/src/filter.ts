/**
 *
 * @param list array of items
 * @param fn function to loop through list
 * @returns filtered items, if fn returns true, that item is included, if fn return false, that item is excluded
 */
export function filter<T>(
  list: Array<T>,
  fn: (item: T, index: number) => boolean,
) {
  const ans: Array<T> = [];
  for (let index = 0; index < list.length; index++) {
    if (fn(list[index], index)) ans.push(list[index]);
  }
  return ans;
}
