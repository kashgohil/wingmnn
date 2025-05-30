/**
 * checks if value is empty or not
 * @param value any value
 * @returns boolean - true, if value is empty object, empty array, empty string, 0, undefined or null, false, otherwise
 */
export function isEmpty(value: TSAny) {
  if (typeof value === "object") {
    if (value == undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    return Object.keys(value).length === 0;
  }

  if (typeof value === "string") return value === "";

  if (typeof value === "number") return !value;

  return false;
}
