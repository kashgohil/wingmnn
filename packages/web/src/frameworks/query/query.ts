import { MINUTE } from "@constants";
import { tryCatchAsync } from "@utility/accessibility/tryCatch";
import { merge } from "@utility/merge";
import { noop } from "@utility/noop";
import { serialize } from "@utility/serialize";
import { Batch } from "./batching";
import { Cache } from "./cache";
import { Poll } from "./polling";

interface QueryParams<T> {
  primaryKey: string;
  secondaryKey: string;
  params: T;
}

interface Params<T, K, S> {
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

const cache = new Cache();
const batch = new Batch();

const SANE_DEFAULT: Partial<Params<TSAny, TSAny, TSAny>> = {
  enabled: true,
  staleTime: 5 * MINUTE,
  polling: {
    interval: MINUTE,
    enabled: false,
  },
};

export class Query<T, K, S = T> {
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

  #polling() {
    const key = this.#serialize(this.#params.key);
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
  }

  #init(params: Partial<Params<T, K, S>>, subscriber: () => void = noop) {
    this.#params = merge(SANE_DEFAULT, params) as Params<T, K, S>;
    this.#subscriber = subscriber;
    this.#executor = batch.batch<T | null, QueryParams<K>>(this.#query);

    if (params.enabled) {
      this.#executor.call(null, this.#params.key);
    }

    this.#polling();
  }

  constructor(params: Params<T, K, S>, subscriber: () => void = noop) {
    this.#init(params, subscriber);
  }

  updateParams(params: Params<T, K, S>) {
    if (this.#serialize(this.#params.key) !== this.#serialize(params.key)) {
      this.#init(params, this.#subscriber);
    } else if (!!this.#params.enabled !== !!params.enabled) {
      this.#init(params, this.#subscriber);
    } else {
      this.#params = params;
    }
  }

  #serialize(key: QueryParams<K>) {
    return serialize(key);
  }

  async #query(key: QueryParams<K>) {
    if (cache.has(key.primaryKey)) {
      this.#result = cache.get(this.#serialize(key)) as S;
    }

    this.status = "fetching";
    const { result, error } = await tryCatchAsync(this.#params.queryFn, key);

    if (error) {
      this.status = "error";
      this.#params.onReject?.(error);
    }

    if (result) {
      this.#result = this.#params.selector?.(result) ?? (result as S);
      this.status = "success";
      cache.set(this.#serialize(key), this.#result, {
        cacheTime: this.#params.staleTime!,
      });
      this.#params.onResolve?.(result);
    }

    this.#subscriber();

    this.initial = false;
    this.refetching = false;

    return result;
  }

  async refetch() {
    this.refetching = true;
    this.status = "fetching";
    this.#subscriber();

    await this.#executor(this.#params.key);
    const { result, error } = await tryCatchAsync(
      this.#executor,
      this.#params.key,
    );

    if (error) {
      this.#error = error;
      this.status = "error";
      this.#params.onReject?.(error);
    }

    if (result) {
      this.#result = this.#params.selector?.(result) ?? (result as S);
      this.status = "success";
      cache.set(this.#params.key.primaryKey, result, {
        cacheTime: this.#params.staleTime!,
      });
      this.#params.onResolve?.(result);
    }

    this.#subscriber();
    this.initial = false;
    this.refetching = false;
  }

  get error() {
    return this.#error;
  }

  get result() {
    return this.#result;
  }

  destroy() {
    this.#poll.forEach((clear) => clear());
  }
}
