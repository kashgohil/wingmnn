export function get(obj: TSAny, path: string | string[], defaultValue?: TSAny): TSAny {
  if (!obj || !path) return defaultValue;

  const pathArray = Array.isArray(path) ? path : path.split('.');

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];
    if (obj[key] === undefined || obj[key] === null) return defaultValue;
    obj = obj[key];
  }

  return obj;
}
