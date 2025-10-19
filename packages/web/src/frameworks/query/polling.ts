import { MINUTE } from "@constants";

export const Poll = {
  poll: function (
    this: TSAny,
    fn: (...args: TSAny[]) => void,
    pollTime: number = MINUTE,
    ...args: TSAny[]
  ) {
    const intervalId = setInterval(() => {
      fn(...args);
    }, pollTime);
    return () => clearInterval(intervalId);
  },
};
