import { MINUTE } from "@constants";
import { deepEqual, merge } from "@wingmnn/utils";

interface Params {
  /**
   * seconds you want the cache to be valid
   */
  cacheTime: number;
}

interface CacheValue<T> {
  value: T;
  params: Params;
  timeoutId: NodeJS.Timeout;
  subscribers: Set<() => void>;
}

const DEFAULT_PARAMS: Params = {
  cacheTime: MINUTE,
};

export class Cache {
  #params: Params;
  #cache: Map<string, CacheValue<TSAny>>;

  constructor(params: Params = DEFAULT_PARAMS) {
    this.#cache = new Map();
    this.#params = merge(DEFAULT_PARAMS, params) as Params;
  }

  #timeout(key: string, cacheTime: number, subscriber?: () => void) {
    const subscribers = this.#cache.get(key)?.subscribers;
    return setTimeout(() => {
      if (subscriber) subscribers?.delete(subscriber);
      this.#cache.delete(key);
    }, cacheTime);
  }

  get(key: string, subscriber?: () => void): TSAny | undefined {
    let cacheValue = this.#cache.get(key);

    if (!cacheValue) {
      cacheValue = {
        value: undefined,
        subscribers: new Set(),
        params: { cacheTime: 2 * MINUTE },
        timeoutId: null as TSAny,
      };
      if (subscriber) cacheValue.subscribers.add(subscriber);
      this.#cache.set(key, cacheValue);
      return cacheValue.value;
    }

    if (cacheValue.timeoutId) clearTimeout(cacheValue.timeoutId);
    cacheValue.timeoutId = this.#timeout(
      key,
      cacheValue.params.cacheTime,
      subscriber,
    );
    if (subscriber && !cacheValue.subscribers.has(subscriber)) {
      cacheValue.subscribers.add(subscriber);
    }

    return cacheValue.value;
  }

  set<T>(key: string, value: T, params: Params = this.#params): T {
    let subscribers = new Set<() => void>();

    const currentCacheValue = this.#cache.get(key);

    if (currentCacheValue) {
      subscribers = currentCacheValue.subscribers;

      clearTimeout(currentCacheValue.timeoutId);
    }

    const newCacheValue = {
      value,
      params,
      subscribers,
      timeoutId: this.#timeout(key, params.cacheTime),
    };

    this.#cache.set(key, newCacheValue);

    if (!currentCacheValue) return value;

    if (!deepEqual(currentCacheValue.value, newCacheValue.value)) {
      subscribers.forEach((fn) => fn());
    }

    return value;
  }

  has(key: string) {
    return this.#cache.has(key);
  }

  invalidate(key: string) {
    if (this.#cache.has(key)) {
      this.#cache.get(key)!.subscribers.clear();
      clearTimeout(this.#cache.get(key)!.timeoutId);
      this.#cache.delete(key);
    }
  }
}
