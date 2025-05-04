import { findIndex } from "./find";

export function upsert<T>(
  list: Array<T>,
  item: T,
  identifier?: (item: T) => boolean,
) {
  const index = findIndex(
    list,
    identifier
      ? identifier
      : (listItem) => (listItem as TSAny)?.id === (item as TSAny)?.id,
  );
  if (index > 0) {
    list[index] = item;
  } else {
    list.push(item);
  }

  return list;
}
