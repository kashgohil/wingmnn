import { forEach } from "./forEach";
import { map } from "./map";

function normalize(obj: TSAny): TSAny {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return map(obj, normalize);
  }

  const keys = Object.keys(obj).sort();
  const normalizedObject: TSAny = {};

  forEach(keys, (key) => {
    normalizedObject[key] = normalize(obj[key]);
  });

  return normalizedObject;
}

export function serialize(obj: TSAny) {
  const normalizedObject = normalize(obj);
  return JSON.stringify(normalizedObject);
}
