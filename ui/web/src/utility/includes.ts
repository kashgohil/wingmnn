export function includes(value: string, match: string): boolean {
  for (let index = 0; index < value.length; index++) {
    let matchIndex = 0;
    while (
      matchIndex < match.length &&
      value[index + matchIndex] === match[matchIndex]
    ) {
      matchIndex++;
    }

    if (matchIndex === match.length) return true;
  }
  return false;
}
