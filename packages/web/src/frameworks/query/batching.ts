import { forEach } from "@utility/forEach";

export class Batch {
  #subscribers: Map<
    string,
    Array<{ resolve: (value: TSAny) => void; reject: (error: Error) => void }>
  >;

  constructor() {
    this.#subscribers = new Map();
  }

  #serialize(args: TSAny) {
    return JSON.stringify(args);
  }

  batch<T, K>(fn: (args: K) => Promise<T>) {
    return (args: K) => {
      const key = this.#serialize(args);

      if (this.#subscribers.has(key)) {
        return new Promise((resolve, reject) => {
          this.#subscribers.get(key)!.push({ resolve, reject });
        });
      }

      this.#subscribers.set(key, []);

      const response = fn(args);

      response
        .then((res) => {
          const resolvers = this.#subscribers
            .get(key)!
            .map(({ resolve }) => resolve);
          forEach(resolvers, (resolve) => resolve(res));
        })
        .catch((error) => {
          const rejectors = this.#subscribers
            .get(key)!
            .map(({ reject }) => reject);
          forEach(rejectors, (reject) => reject(error));
        })
        .finally(() => {
          this.#subscribers.delete(key);
        });

      return new Promise<T>((resolve, reject) => {
        this.#subscribers.get(key)!.push({ resolve, reject });
      });
    };
  }
}
