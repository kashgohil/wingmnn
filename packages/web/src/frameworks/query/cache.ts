import { MINUTE } from "@constants";
import { isEqual, merge } from "@wingmnn/utils";

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
    const subscribers = this.#cache.get(key)!.subscribers;
    return setTimeout(() => {
      if (subscriber) subscribers.delete(subscriber);
      this.#cache.delete(key);
    }, cacheTime);
  }

  get(key: string, subscriber?: () => void): TSAny | undefined {
    const cacheValue = this.#cache.get(key);
    if (!cacheValue) {
      throw new Error(`no value found for ${key} in Cache`);
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

    if (this.#cache.has(key)) {
      const cacheValue = this.#cache.get(key)!;
      subscribers = cacheValue.subscribers;

      clearTimeout(cacheValue.timeoutId);

      if (!isEqual(value, cacheValue.value)) {
        subscribers.forEach((fn) => fn());
      }
    }

    const cacheValue = {
      value,
      params,
      subscribers,
      timeoutId: this.#timeout(key, params.cacheTime),
    };

    this.#cache.set(key, cacheValue);
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
