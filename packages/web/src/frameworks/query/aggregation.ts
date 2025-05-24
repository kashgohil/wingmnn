import { debounce } from "@utility/debounce";
import { forEach } from "@utility/forEach";

type WithID<T> = T & { id: string };

interface Params<T, K extends { id: string }> {
  waitTime: number;
  aggregationKey: string;
  executor: (args: Array<K>) => Promise<{ [id in string]: T }>;
}

export class Aggregation {
  #subscribers: Map<
    string,
    Array<{
      id: string;
      resolve: <T>(result: T) => void;
      reject: (error: Error) => void;
    }>
  >;

  constructor() {
    this.#subscribers = new Map();
  }

  #trigger<T, K extends { id: string }>(
    aggregationKey: string,
    fn: (args: Array<K>) => Promise<{ [key in string]: T }>,
  ) {
    return (...args: Array<WithID<K>>) => {
      fn(args)
        .then((res) => {
          const resolvers = this.#subscribers.get(aggregationKey)!;
          forEach(resolvers, ({ resolve, id }) => resolve(res[id]));
        })
        .catch((error) => {
          const rejectors = this.#subscribers.get(aggregationKey)!;
          forEach(rejectors, ({ reject }) => reject(error));
        })
        .finally(() => {
          this.#subscribers.delete(aggregationKey);
        });
    };
  }

  aggregate<T, K extends { id: string }>(params: Params<T, K>) {
    const { aggregationKey, executor, waitTime = 200 } = params;

    const debouncedFn = debounce(
      this.#trigger(aggregationKey, executor),
      waitTime,
    );

    return (args: K) => {
      debouncedFn(args);

      if (!this.#subscribers.has(aggregationKey)) {
        this.#subscribers.set(aggregationKey, []);
      }

      return new Promise((resolve, reject) => {
        this.#subscribers
          .get(aggregationKey)!
          .push({ id: args.id, resolve, reject });
      });
    };
  }
}
