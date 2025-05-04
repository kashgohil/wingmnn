type Effect<T> = (store: Store<T>) => void;
type EffectsMap<T> = { [key in keyof T]: Set<Effect<T>> };

type Subscriber<T> = Effect<T>;
type SubscribersMap<T> = { [key in keyof T]: Set<Subscriber<T>> };

export class Store<T> {
  #state: T = {} as T;
  #effects: EffectsMap<T> = {} as EffectsMap<T>;
  #subscribers: SubscribersMap<T> = {} as SubscribersMap<T>;

  constructor(state?: T) {
    if (!state) {
      this.#state = {} as T;
      this.#effects = {} as EffectsMap<T>;
      this.#subscribers = {} as SubscribersMap<T>;
    } else {
      this.initialize(state);
    }
  }

  initialize(state: T) {
    this.#state = state;
    for (const key in this.#state) {
      this.#subscribers[key] = new Set();
      this.#effects[key] = new Set();
    }
  }

  /**
   * @param key key you want to access from store
   * @param subscribe [optional] if you want to pass a subscriber to make this get value reactive, then you can pass it here
   * @returns value for that key in store
   *
   * @description this will return the value for the given key in the store. If a subscriber is provided, it will be added to the list of subscribers for that key. if you want the value to be reactive, pass a subscriber function. otherwise, when value changes, you will not receive reactive updates.
   */
  get<TKey extends keyof T>(
    key: TKey,
    subscribe?: (store: Store<T>) => void,
  ): T[TKey] {
    if (subscribe) {
      this.subscribe(key, subscribe);
    }
    return this.#state[key];
  }

  /**
   * @param key key for what you want to store
   * @param value what you want to store against that key
   */
  set<TKey extends keyof T>(key: TKey, value: T[TKey]) {
    this.#state[key] = value;
    if (this.#subscribers[key].size > 0) {
      this.#subscribers[key].forEach((subscriber) => subscriber(this));
      this.runEffects(key);
    }
  }

  /**
   * @param updates updates you want to store
   */
  updates(updates: Partial<T> | ((state: T) => Partial<T>)) {
    if (typeof updates === "function") {
      updates = updates(this.#state);
    }
    for (const key in updates) {
      this.set(key, updates[key] as T[keyof T]);
    }
  }

  /**
   * @param key key you want to remove from store
   */
  remove(key: keyof T) {
    delete this.#state[key];
    delete this.#subscribers[key];
  }

  /**
   * @param key key for the subscriber set
   * @param callback callback you want to run on key value change
   */
  subscribe(key: keyof T, callback: (store: Store<T>) => void) {
    if (!this.#subscribers[key]) {
      this.#subscribers[key] = new Set();
    }
    this.#subscribers[key].add(callback);

    return () => {
      this.unsubscribe(key, callback);
    };
  }

  /**
   * @param key key you want to unsubscribe from
   * @param callback callback you want to unsubscribe
   */
  unsubscribe(key: keyof T, callback: (store: Store<T>) => void) {
    if (this.#subscribers[key]) {
      this.#subscribers[key].delete(callback);
    }
  }

  addEffect(key: keyof T, effect: (store: Store<T>) => void) {
    if (!this.#effects[key]) {
      this.#effects[key] = new Set();
    }
    this.#effects[key].add(effect);
  }

  removeEffect(key: keyof T, effect: (store: Store<T>) => void) {
    if (this.#effects[key]) {
      this.#effects[key].delete(effect);
    }
  }

  runEffects(key: keyof T) {
    if (this.#effects[key]) {
      this.#effects[key].forEach((effect) => effect(this));
    }
  }
}
