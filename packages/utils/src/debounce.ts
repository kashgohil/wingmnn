import { tryCatchAsync } from "./tryCatch";

export function aggregatingDebounce(
  fn: (...args: TSAny[]) => void,
  waitTime: number,
) {
  let timeoutId: NodeJS.Timeout;
  let updatedArgs: TSAny[] = [];

  return function (this: TSAny, ...args: TSAny[]) {
    updatedArgs.push(...args);

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, updatedArgs);

      updatedArgs = [];
    }, waitTime);
  };
}

export function debounce(fn: (...args: TSAny[]) => void, waitTime: number) {
  let timeoutId: NodeJS.Timeout;

  return function (this: TSAny, ...args: TSAny[]) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, waitTime);
  };
}

export function promiseDebounce<T>(
  fn: (...args: TSAny[]) => Promise<T>,
  waitTime: number,
) {
  let timeoutId: NodeJS.Timeout;
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};

  return function (this: TSAny, ...args: TSAny[]) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {
      const { result, error } = await tryCatchAsync(fn.apply(this, args));
      if (error) reject(error);
      else resolve(result);
    }, waitTime);

    return new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };
}
