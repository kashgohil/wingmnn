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

const SECOND = 1000;
const MULTIPLIER = 5;
const MINUTE = 60 * SECOND;

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
