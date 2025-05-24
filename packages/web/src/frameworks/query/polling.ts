export const Poll = {
  poll: function (this: TSAny, fn: () => void, pollTime: number = 1000 * 60) {
    const intervalId = setInterval(fn, pollTime);
    return () => clearInterval(intervalId);
  },
};
