import { isEmpty } from "./isEmpty";
import { isPrimitive } from "./isPrimitive";
import { reduce } from "./reduce";

export function stripEmptyValues(value: TSAny): TSAny {
  if (isPrimitive(value)) return isEmpty(value) ? undefined : value;

  if (Array.isArray(value)) {
    return value.map(stripEmptyValues);
  }

  if (typeof value === "object") {
    return reduce(
      value,
      (accm, item, key) => {
        if (isEmpty(item)) return accm;
        accm[key] = isPrimitive(item) ? item : stripEmptyValues(value);
      },
      {} as TSAny,
    );
  }
  return value;
}
