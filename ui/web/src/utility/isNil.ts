/**
 * @param value value to check for nil
 * @returns true if value is nil, false if value is not nil
 */
export function isNil(value: TSAny) {
  if (value == undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}
