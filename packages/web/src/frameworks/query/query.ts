import { MINUTE } from "@constants";
import { merge, noop, tryCatchAsync } from "@wingmnn/utils";
import { Batch } from "./batching";
import { Cache } from "./cache";
import { Poll } from "./polling";
import { serializeKey } from "./utils";

export interface QueryParams<T> {
  primaryKey: string;
  secondaryKey?: string;
  params?: T;
}

export interface Params<T, K, S> {
  /**
   * The key to use for the query. ideally, this should be a unique identifier for the query. and this should hold all the dependencies for the query.
   */
  key: QueryParams<K>;
  /**
   * The function to use for the query.
   *
   * NOTE: make sure function's reference remains same during the lifetime of the query.
   */
  queryFn: (queryParams: QueryParams<K>) => Promise<T>;
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
  onResolve?(response: T): void;
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
}

const SANE_DEFAULT: Partial<Params<TSAny, TSAny, TSAny>> = {
  enabled: true,
  staleTime: 5 * MINUTE,
  polling: {
    interval: MINUTE,
    enabled: false,
  },
};

export class Query<T, K, S = T> {
  #cache: Cache;
  #batch: Batch;

  #params: Params<T, K, S> = SANE_DEFAULT as Params<T, K, S>;
  #subscriber: () => void = noop;
  #executor: (key: QueryParams<K>) => Promise<T | null> = () =>
    Promise.resolve(null);

  #error: Error | null = null;
  #result: S | null = null;

  #poll: Map<string, () => void> = new Map();

  initial: boolean = true;
  refetching: boolean = false;
  status: "idle" | "fetching" | "error" | "success" = "idle";

  #polling = () => {
    const key = serializeKey(this.#params.key);
    if (
      this.#params.enabled &&
      this.#params.polling?.enabled &&
      !this.#poll.has(key)
    ) {
      const clear = Poll.poll(
        this.#executor,
        this.#params.polling.interval,
        this.#params.key,
      );
      this.#poll.set(key, clear);
    }
  };

  #query = async (key: QueryParams<K>) => {
    if (this.#cache.has(serializeKey(key))) {
      this.#result = this.#cache.get(serializeKey(key)) as S;
      return null;
    }

    this.status = "fetching";
    if (this.status !== "fetching") this.#subscriber();

    const { result, error } = await tryCatchAsync(this.#params.queryFn(key));

    if (error) {
      this.status = "error";
      this.#params.onReject?.(error);
    }

    if (result) {
      this.#result = this.#params.selector?.(result) ?? (result as S);
      this.status = "success";
      this.#cache.set(serializeKey(key), this.#result, {
        cacheTime: this.#params.staleTime!,
      });
      this.#params.onResolve?.(result);
    }

    this.#subscriber();

    this.initial = false;
    this.refetching = false;

    return this.#result;
  };

  #init = (params: Partial<Params<T, K, S>>, subscriber: () => void = noop) => {
    this.#params = merge(SANE_DEFAULT, params) as Params<T, K, S>;
    this.#subscriber = subscriber;
    this.#executor = this.#batch.batch<S | null, QueryParams<K>>(this.#query);

    if (this.#params.enabled) {
      this.#executor.call(null, this.#params.key);
    }

    this.#polling();
  };

  constructor(
    cache: Cache,
    batch: Batch,
    params: Params<T, K, S>,
    subscriber: () => void = noop,
  ) {
    this.#cache = cache;
    this.#batch = batch;
    this.#init(params, subscriber);
  }

  updateParams = (params: Params<T, K, S>) => {
    if (serializeKey(this.#params.key) !== serializeKey(params.key)) {
      this.#init(params, this.#subscriber);
    } else if (!!this.#params.enabled !== !!params.enabled) {
      this.#init(params, this.#subscriber);
    } else {
      this.#params = params;
    }
  };

  refetch = async () => {
    this.refetching = true;
    this.status = "fetching";
    this.#subscriber();

    const { result, error } = await tryCatchAsync(
      this.#executor(this.#params.key),
    );

    if (error) {
      this.#error = error;
      this.status = "error";
      this.#params.onReject?.(error);
    }

    if (result) {
      this.#result = this.#params.selector?.(result) ?? (result as S);
      this.status = "success";
      this.#cache.set(this.#params.key.primaryKey, result, {
        cacheTime: this.#params.staleTime!,
      });
      this.#params.onResolve?.(result);
    }

    this.#subscriber();
    this.initial = false;
    this.refetching = false;
  };

  get error() {
    return this.#error;
  }

  get result() {
    return this.#result;
  }

  destroy() {
    this.#subscriber = () => {};
    this.#poll.forEach((clear) => clear());
  }
}
