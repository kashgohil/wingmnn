export function debounce(fn: (...args: TSAny[]) => void, waitTime: number) {
  let timeoutId: NodeJS.Timeout;
  let updatedArgs: TSAny[] = [];

  return function (this: TSAny, ...args: TSAny[]) {
    updatedArgs.push(...args);

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, updatedArgs);

      updatedArgs = [];
      clearTimeout(timeoutId);
    }, waitTime);
  };
}
