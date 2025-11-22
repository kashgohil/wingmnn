/**
 * Catch Error Utility
 *
 * Wraps promises to return [result, error] tuples instead of throwing.
 * This allows handling errors as values, similar to Go's error handling.
 *
 * @example
 * ```typescript
 * // Instead of try-catch:
 * try {
 *   const data = await fetchData();
 *   console.log(data);
 * } catch (error) {
 *   console.error(error);
 * }
 *
 * // Use catchError:
 * const [data, error] = await catchError(fetchData());
 * if (error) {
 *   console.error(error);
 *   return;
 * }
 * console.log(data);
 * ```
 */

/**
 * Wraps a promise and returns a tuple of [result, error]
 * If the promise resolves, returns [result, null]
 * If the promise rejects, returns [null, error]
 *
 * @param promise - The promise to wrap
 * @returns A tuple of [result, error]
 */
export async function catchError<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    // Ensure error is an Error instance
    if (error instanceof Error) {
      return [null, error];
    }
    // Convert non-Error objects to Error
    return [null, new Error(String(error))];
  }
}

/**
 * Synchronous version of catchError for functions that might throw
 *
 * @param fn - The function to execute
 * @returns A tuple of [result, error]
 */
export function catchErrorSync<T>(fn: () => T): [T, null] | [null, Error] {
  try {
    const data = fn();
    return [data, null];
  } catch (error) {
    if (error instanceof Error) {
      return [null, error];
    }
    return [null, new Error(String(error))];
  }
}

/**
 * Type guard to check if an error occurred
 * Useful for narrowing types in conditional checks
 *
 * @example
 * ```typescript
 * const result = await catchError(fetchData());
 * if (isError(result)) {
 *   // result is [null, Error]
 *   console.error(result[1]);
 * } else {
 *   // result is [Data, null]
 *   console.log(result[0]);
 * }
 * ```
 */
export function isError<T>(
  result: [T, null] | [null, Error]
): result is [null, Error] {
  return result[1] !== null;
}

/**
 * Type guard to check if the operation succeeded
 *
 * @example
 * ```typescript
 * const result = await catchError(fetchData());
 * if (isSuccess(result)) {
 *   // result is [Data, null]
 *   console.log(result[0]);
 * }
 * ```
 */
export function isSuccess<T>(
  result: [T, null] | [null, Error]
): result is [T, null] {
  return result[1] === null;
}
