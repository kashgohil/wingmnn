import React from 'react';

export function useCounter() {
	const [count, setCount] = React.useState(0);

	const increment = React.useCallback(() => setCount((c) => c + 1), []);
	const decrement = React.useCallback(() => setCount((c) => c - 1), []);

	return { count, increment, decrement };
}
