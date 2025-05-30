import { MINUTE } from "@constants";
import { merge } from "utils";

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

  #timeout(key: string, params: Params) {
    return setTimeout(() => {
      this.#cache.delete(key);
    }, params.cacheTime);
  }

  get(key: string): TSAny | undefined {
    const cacheValue = this.#cache.get(key);
    if (!cacheValue) {
      throw new Error(`no value found for ${key} in Cache`);
    }

    if (cacheValue.timeoutId) clearTimeout(cacheValue.timeoutId);
    cacheValue.timeoutId = this.#timeout(key, cacheValue.params);

    return cacheValue.value;
  }

  set<T>(key: string, value: T, params: Params = this.#params): T {
    if (this.#cache.has(key)) {
      const timeoutId = this.#cache.get(key)!.timeoutId;
      clearTimeout(timeoutId);
    }

    const cacheValue = {
      value,
      params,
      timeoutId: this.#timeout(key, params),
    };

    this.#cache.set(key, cacheValue);
    return value;
  }

  has(key: string) {
    return this.#cache.has(key);
  }
}
