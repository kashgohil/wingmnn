import { serialize } from "utils";

export class Batch {
  #subscribers: Map<string, Promise<TSAny>>;

  constructor() {
    this.#subscribers = new Map();
  }

  #serialize(args: TSAny) {
    return serialize(args);
  }

  batch<T, K>(fn: (args: K) => Promise<T>) {
    return (args: K) => {
      const key = this.#serialize(args);

      if (this.#subscribers.has(key)) {
        return this.#subscribers.get(key)!;
      }

      const response = fn(args);
      this.#subscribers.set(key, response);

      response
        .then((res) => res)
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          this.#subscribers.delete(key);
        });

      return response;
    };
  }
}
