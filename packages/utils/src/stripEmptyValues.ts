import { isEmpty } from "./isEmpty";
import { isPrimitive } from "./isPrimitive";
import { reduceObj } from "./reduce";

export function stripEmptyValues(value: TSAny): TSAny {
  if (isEmpty(value)) return value;
  if (isPrimitive(value)) return value;

  if (Array.isArray(value)) {
    return value.map(stripEmptyValues).filter(Boolean);
  }

  if (typeof value === "object") {
    return reduceObj(
      value,
      (accm, item, key) => {
        if (isEmpty(item)) return accm;
        accm[key] = isPrimitive(item) ? item : stripEmptyValues(item);
        return accm;
      },
      {} as TSAny,
    );
  }
  return value;
}
