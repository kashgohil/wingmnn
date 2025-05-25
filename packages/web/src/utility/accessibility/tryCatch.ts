interface Success<T> {
  result: T;
  error: null;
}

interface Failure {
  result: null;
  error: Error;
}

type TryCatchResult<T> = Success<T> | Failure;

export function tryCatch<T>(
  fn: (...args: TSAny[]) => T | Promise<T>,
  ...args: TSAny[]
): TryCatchResult<T> {
  try {
    const resultOrPromise = fn(...args);
    return { result: resultOrPromise as T, error: null } as Success<T>;
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
    return { result: null, error } as Failure;
  }
}

export async function tryCatchAsync<T>(
  fn: (...args: TSAny[]) => Promise<T>,
  ...args: TSAny[]
): Promise<TryCatchResult<T>> {
  try {
    const result = await fn(...args);
    return { result, error: null } as Success<T>;
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
    return { result: null, error } as Failure;
  }
}
