import { useCounter } from './useCounter';

export function useForceRender() {
	const { increment } = useCounter();
	return increment;
}
