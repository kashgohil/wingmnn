export const Poll = {
	poll: function (this: TSAny, fn: (...args: TSAny[]) => void, pollTime: number = 1000 * 60, ...args: TSAny[]) {
		const intervalId = setInterval(() => fn(...args), pollTime);
		return () => clearInterval(intervalId);
	},
};
