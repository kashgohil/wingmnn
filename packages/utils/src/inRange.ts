/**
 *
 * @param value value to check
 * @param range [lower,upper] bounds, both are inclusive
 * @returns boolean - true, if value is in range, false otherwise
 */
export function inRange(
  value: number,
  range: [number, number],
  type: "inclusive" | "exclusive" = "exclusive",
): boolean {
  switch (type) {
    case "exclusive":
      return value > range[0] && value < range[1];
    case "inclusive":
      return value >= range[0] && value <= range[1];
  }
}
