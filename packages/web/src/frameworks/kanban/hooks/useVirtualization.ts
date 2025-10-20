import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseVirtualizationProps<T> {
	items: T[];
	estimatedItemHeight: number;
	containerHeight: number;
	overscan?: number;
}

interface ItemMeasurement {
	height: number;
	top: number;
}

interface VirtualizationState {
	scrollTop: number;
	visibleStartIndex: number;
	visibleEndIndex: number;
	totalHeight: number;
	offsetY: number;
	itemMeasurements: Map<number, ItemMeasurement>;
}

export function useVirtualization<T>({
	items,
	estimatedItemHeight,
	containerHeight,
	overscan = 3,
}: UseVirtualizationProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

	const [state, setState] = useState<VirtualizationState>({
		scrollTop: 0,
		visibleStartIndex: 0,
		visibleEndIndex: Math.min(items.length - 1, Math.floor(containerHeight / estimatedItemHeight) + overscan),
		totalHeight: items.length * estimatedItemHeight,
		offsetY: 0,
		itemMeasurements: new Map(),
	});

	// Helper function to recalculate measurements
	const recalculateMeasurements = useCallback(
		(measurements: Map<number, ItemMeasurement>) => {
			// Recalculate total height
			let totalHeight = 0;
			for (let i = 0; i < items.length; i++) {
				const measurement = measurements.get(i);
				if (measurement) {
					totalHeight += measurement.height;
				} else {
					totalHeight += estimatedItemHeight;
				}
			}

			// Recalculate positions
			let currentTop = 0;
			const newMeasurements = new Map(measurements);
			for (let i = 0; i < items.length; i++) {
				const measurement = newMeasurements.get(i);
				if (measurement) {
					newMeasurements.set(i, { ...measurement, top: currentTop });
					currentTop += measurement.height;
				} else {
					currentTop += estimatedItemHeight;
				}
			}

			return { newMeasurements, totalHeight };
		},
		[items.length, estimatedItemHeight]
	);

	// Measure item heights when they mount or update
	const measureItem = useCallback(
		(index: number, element: HTMLDivElement | null) => {
			if (!element) return;

			itemRefs.current.set(index, element);

			// Use ResizeObserver to track height changes
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const height = entry.contentRect.height;
					setState((prev) => {
						// Check if height actually changed to prevent infinite loops
						const currentMeasurement = prev.itemMeasurements.get(index);
						if (currentMeasurement && Math.abs(currentMeasurement.height - height) < 1) {
							return prev; // No significant change, don't update
						}

						const newMeasurements = new Map(prev.itemMeasurements);
						const oldMeasurement = newMeasurements.get(index);
						const top = oldMeasurement?.top ?? index * estimatedItemHeight;

						newMeasurements.set(index, { height, top });

						const { newMeasurements: recalculatedMeasurements, totalHeight } = recalculateMeasurements(newMeasurements);

						return {
							...prev,
							itemMeasurements: recalculatedMeasurements,
							totalHeight,
						};
					});
				}
			});

			resizeObserver.observe(element);

			// Initial measurement
			const height = element.offsetHeight;
			setState((prev) => {
				// Check if we already have a measurement for this index
				if (prev.itemMeasurements.has(index)) {
					return prev; // Already measured, don't update
				}

				const newMeasurements = new Map(prev.itemMeasurements);
				const top = index * estimatedItemHeight;

				newMeasurements.set(index, { height, top });

				const { newMeasurements: recalculatedMeasurements, totalHeight } = recalculateMeasurements(newMeasurements);

				return {
					...prev,
					itemMeasurements: recalculatedMeasurements,
					totalHeight,
				};
			});

			return () => {
				resizeObserver.disconnect();
				itemRefs.current.delete(index);
			};
		},
		[items.length, estimatedItemHeight, recalculateMeasurements]
	);

	const calculateVisibleRange = useCallback(
		(scrollTop: number) => {
			// Find visible range based on actual item positions
			let visibleStartIndex = 0;
			let visibleEndIndex = items.length - 1;

			// Find start index
			for (let i = 0; i < items.length; i++) {
				const measurement = state.itemMeasurements.get(i);
				const itemTop = measurement?.top ?? i * estimatedItemHeight;
				const itemHeight = measurement?.height ?? estimatedItemHeight;

				if (itemTop + itemHeight > scrollTop) {
					visibleStartIndex = Math.max(0, i - overscan);
					break;
				}
			}

			// Find end index
			for (let i = visibleStartIndex; i < items.length; i++) {
				const measurement = state.itemMeasurements.get(i);
				const itemTop = measurement?.top ?? i * estimatedItemHeight;

				if (itemTop > scrollTop + containerHeight) {
					visibleEndIndex = Math.min(items.length - 1, i + overscan);
					break;
				}
			}

			// Calculate offset for the visible start item
			const startMeasurement = state.itemMeasurements.get(visibleStartIndex);
			const offsetY = startMeasurement?.top ?? visibleStartIndex * estimatedItemHeight;

			return {
				visibleStartIndex,
				visibleEndIndex,
				totalHeight: state.totalHeight,
				offsetY,
			};
		},
		[items.length, estimatedItemHeight, containerHeight, overscan, state.itemMeasurements, state.totalHeight]
	);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const scrollTop = e.currentTarget.scrollTop;
			const newState = calculateVisibleRange(scrollTop);

			setState((prev) => ({
				...prev,
				scrollTop,
				...newState,
			}));
		},
		[calculateVisibleRange]
	);

	// Update visible range when items change - use useLayoutEffect to prevent flicker
	useLayoutEffect(() => {
		const newState = calculateVisibleRange(state.scrollTop);
		setState((prev) => ({
			...prev,
			...newState,
		}));
	}, [items.length, calculateVisibleRange, state.scrollTop]);

	// Cleanup ResizeObserver on unmount
	useEffect(() => {
		return () => {
			// ResizeObserver cleanup is handled in measureItem return function
			itemRefs.current.clear();
		};
	}, []);

	// Reset measurements when items change
	useEffect(() => {
		setState((prev) => ({
			...prev,
			itemMeasurements: new Map(),
			totalHeight: items.length * estimatedItemHeight,
		}));
	}, [items.length, estimatedItemHeight]);

	const visibleItems = items.slice(state.visibleStartIndex, state.visibleEndIndex + 1);
	const visibleItemsWithIndex = visibleItems.map((item, index) => ({
		item,
		index: state.visibleStartIndex + index,
	}));

	return {
		containerRef,
		visibleItems: visibleItemsWithIndex,
		totalHeight: state.totalHeight,
		offsetY: state.offsetY,
		handleScroll,
		measureItem,
		getItemHeight: (index: number) => {
			const measurement = state.itemMeasurements.get(index);
			return measurement?.height ?? estimatedItemHeight;
		},
		averageHeight: (() => {
			const values = Array.from(state.itemMeasurements.values());
			if (values.length === 0) return estimatedItemHeight;
			const sum = values.reduce((acc, m) => acc + m.height, 0);
			return sum / values.length;
		})(),
	};
}
