import { MINUTE } from "@constants";
import { merge, noop, promiseDebounce, tryCatchAsync } from "@wingmnn/utils";
import { Batch } from "./batching";
import { Cache } from "./cache";
import { Poll } from "./polling";
import { serializeKey } from "./utils";

export interface QueryParams<T> {
  primaryKey: string;
  secondaryKey?: string;
  params?: T;
}

export interface Params<T, K, S = T, MArgs extends TSAny[] = TSAny[]> {
  /**
   * The key to use for the query. ideally, this should be a unique identifier for the query. and this should hold all the dependencies for the query.
   */
  key: QueryParams<K>;
  /**
   * The function to use for the query.
   *
   * NOTE: make sure function's reference remains same during the lifetime of the query.
   */
  queryFn?: (queryParams: QueryParams<K>) => Promise<T>;
  /**
   * The function to use for the mutation.
   *
   * NOTE: make sure function's reference remains same during the lifetime of the query.
   */
  mutationFn?: (key: QueryParams<K>, ...params: MArgs) => Promise<T>;
  /**
   * The function to use for the onMutate.
   */
  onMutate?: (key: QueryParams<K>, ...args: MArgs) => S;
  /**
   * The time to cache the query for. after this time, query will be refetched.
   */
  staleTime?: number;
  /**
   * The enabled state of the query.
   */
  enabled?: boolean;
  /**
   * The function to use for the selector.
   */
  selector?(response: T): S;
  /**
   * The function to use for the onReject.
   */
  onReject?(error: Error): void;
  /**
   * The function to use for the onResolve.
   */
  onResolve?(response: S): void;
  /**
   * The function to use for the onSettled.
   */
  onSettled?(response: S | null, error: Error | null): void;
  /**
   * The polling to use for the query.
   */
  polling?: {
    /**
     * The interval to use for the polling.
     */
    interval: number;
    /**
     * The enabled state of the polling.
     */
    enabled: boolean;
  };
  /**
   * Debounce for mutation query
   */
  debounce?: {
    /**
     * Flag to check if debounce is enabled or not
     */
    enabled: boolean;
    /**
     * The debounce time to use for the mutation query.
     */
    debounceTime?: number;
  };
}

const SANE_DEFAULT: Partial<Params<TSAny, TSAny, TSAny>> = {
  enabled: true,
  staleTime: 5 * MINUTE,
  polling: {
    interval: MINUTE,
    enabled: false,
  },
};

export class Query<T, K, S = T, MArgs extends TSAny[] = TSAny[]> {
  private cache: Cache;
  private batch: Batch;

  private params: Params<T, K, S> = SANE_DEFAULT as Params<T, K, S>;
  private subscriber: () => void = noop;
  private executor: (key: QueryParams<K>) => Promise<T | null> = () =>
    Promise.resolve(null);
  private mutation: (key: QueryParams<K>, ...args: MArgs) => Promise<T | null> =
    () => Promise.resolve(null);

  private _error: Error | null = null;
  private _result: S | null = null;

  private poll: Map<string, () => void> = new Map();

  initial: boolean = true;
  refetching: boolean = false;
  status: "idle" | "fetching" | "error" | "success" | "mutating" = "idle";

  private polling = () => {
    const key = serializeKey(this.params.key);
    if (
      this.params.enabled &&
      this.params.polling?.enabled &&
      !this.poll.has(key)
    ) {
      const clear = Poll.poll(this.refetch, this.params.polling.interval);
      this.poll.set(key, clear);
    }
  };

  private query = async (key: QueryParams<K>) => {
    const serializedKey = serializeKey(key);
    if (!this.refetching && this.cache.has(serializedKey)) {
      this._result = this.cache.get(serializedKey) as S;
      this.status = "success";
      return this._result;
    }

    this.status = "fetching";
    if (this.status !== "fetching") this.subscriber();

    const { result, error } = await tryCatchAsync(this.params.queryFn!(key));

    if (error) {
      this.status = "error";
      this._error = error;
      this.params.onReject?.(error);
    }

    if (result) {
      this._result = this.params.selector?.(result) ?? (result as S);
      this.status = "success";
      this.cache.set(serializedKey, this._result, {
        cacheTime: this.params.staleTime!,
      });
      this.params.onResolve?.(this._result);
    }

    this.params.onSettled?.(this._result, this._error);

    this.subscriber();

    this.initial = false;
    this.refetching = false;

    return this._result;
  };

  private init = (
    params: Partial<Params<T, K, S>>,
    subscriber: () => void = noop,
  ) => {
    this.params = merge(SANE_DEFAULT, params) as Params<T, K, S>;
    this.subscriber = subscriber;

    if (this.params.queryFn) {
      this.executor = this.batch.batch<S | null, QueryParams<K>>(this.query);

      if (this.params.enabled) {
        this.executor.call(null, this.params.key);
      }

      this.polling();
    }

    if (this.params.mutationFn && this.params.debounce) {
      this.mutation = promiseDebounce<T>(
        this.params.mutationFn,
        this.params.debounce.debounceTime || 200,
      );
    }
  };

  constructor(
    cache: Cache,
    batch: Batch,
    params: Params<T, K, S>,
    subscriber: () => void = noop,
  ) {
    this.cache = cache;
    this.batch = batch;
    this.init(params, subscriber);
  }

  updateParams = (params: Params<T, K, S>) => {
    if (serializeKey(this.params.key) !== serializeKey(params.key)) {
      this.init(params, this.subscriber);
    } else if (!!params.enabled && !!this.params.enabled !== !!params.enabled) {
      this.init(params, this.subscriber);
    } else {
      this.params = merge(this.params, params);
    }
  };

  refetch = async () => {
    this.refetching = true;
    this.status = "fetching";
    this.subscriber();

    const { result, error } = await tryCatchAsync(
      this.executor(this.params.key),
    );

    if (error) {
      this._error = error;
      this.status = "error";
      this.params.onReject?.(error);
    }

    if (result) {
      this._result = this.params.selector?.(result) ?? (result as S);
      this.status = "success";
      this.cache.set(serializeKey(this.params.key), result, {
        cacheTime: this.params.staleTime!,
      });
      this.params.onResolve?.(this._result);
    }

    this.subscriber();
    this.initial = false;
    this.refetching = false;
  };

  mutate = async (...args: MArgs) => {
    const key = serializeKey(this.params.key);
    const previousValue = this.cache.get(key);

    this.status = "mutating";
    this.subscriber();

    if (this.params.onMutate) {
      const updatedValue = this.params.onMutate(this.params.key, ...args);
      this.cache.set(key, updatedValue, {
        cacheTime: this.params.staleTime!,
      });
      this.subscriber();
    }

    const { result, error } = await tryCatchAsync(
      this.mutation!(this.params.key, ...args),
    );

    if (error) {
      this._error = error;
      this.status = "error";
      this.params.onReject?.(this._error);
      this.cache.set(key, previousValue);
    }

    if (result) {
      this._result = this.params.selector?.(result) ?? (result as S);
      this.status = "success";
      this.cache.set(key, this._result, {
        cacheTime: this.params.staleTime!,
      });
      this.params.onResolve?.(this._result);
    }

    this.subscriber();
  };

  get error() {
    return this._error;
  }

  get result() {
    return (
      this.cache.get<S>(serializeKey(this.params.key), this.subscriber) ||
      this._result
    );
  }

  destroy() {
    this.subscriber = () => {};
    this.poll.forEach((clear) => clear());
  }
}
