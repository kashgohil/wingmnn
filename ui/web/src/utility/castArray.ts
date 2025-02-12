/**
 * @param value value to cast
 * @returns value cast as array
 */
export function castArray(value: TSAny) {
  if (Array.isArray(value)) return value;
  return [value];
}
