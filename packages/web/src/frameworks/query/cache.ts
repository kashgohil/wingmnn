import { MINUTE, SECOND } from "@constants";

interface Params {
  /**
   * seconds you want the cache to be valid
   */
  cacheTime: number;
}

interface CacheValue<T> {
  value: T;
  params: Params;
  lastAccessed: number;
}

const MULTIPLIER = 5;

const DEFAULT_PARAMS: Params = {
  cacheTime: MINUTE,
};

export class Cache {
  #params: Params;
  #cache: Map<string, CacheValue<TSAny>>;

  constructor(params?: Params) {
    this.#cache = new Map();
    this.#params = Object.assign({}, DEFAULT_PARAMS, params);

    setInterval(this.#validate, MULTIPLIER * SECOND);
  }

  get(key: string): TSAny | undefined {
    const cacheValue = this.#cache.get(key);
    if (!cacheValue) {
      throw new Error(`no value found for ${key} in Cache`);
    }

    cacheValue.lastAccessed = this.#currentTime();

    return cacheValue.value;
  }

  set<T>(key: string, value: T, params: Params = this.#params): T {
    this.#cache.set(key, {
      value,
      params,
      lastAccessed: this.#currentTime(),
    });
    return value;
  }

  has(key: string) {
    return this.#cache.has(key);
  }

  #validate() {
    this.#cache.forEach((cacheValue, key) => {
      if (cacheValue.lastAccessed - Date.now() > cacheValue.params.cacheTime)
        this.#cache.delete(key);
    });
  }

  #currentTime() {
    return Date.now();
  }
}
