import type { Block } from "../types";

export class PerformanceOptimizer {
	/**
	 * Debounce function for performance optimization
	 */
	static debounce<T extends (...args: TSAny[]) => TSAny>(
		func: T,
		wait: number,
	): (...args: Parameters<T>) => void {
		let timeout: NodeJS.Timeout;
		return (...args: Parameters<T>) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	}

	/**
	 * Throttle function for performance optimization
	 */
	static throttle<T extends (...args: TSAny[]) => TSAny>(
		func: T,
		limit: number,
	): (...args: Parameters<T>) => void {
		let inThrottle: boolean;
		return (...args: Parameters<T>) => {
			if (!inThrottle) {
				func(...args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), limit);
			}
		};
	}

	/**
	 * Memoize expensive calculations
	 */
	static memoize<T extends (...args: TSAny[]) => TSAny>(
		fn: T,
		keyGenerator?: (...args: Parameters<T>) => string,
	): T {
		const cache = new Map<string, ReturnType<T>>();

		return ((...args: Parameters<T>) => {
			const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

			if (cache.has(key)) {
				return cache.get(key);
			}

			const result = fn(...args);
			cache.set(key, result);
			return result;
		}) as T;
	}

	/**
	 * Batch state updates to prevent excessive re-renders
	 */
	static batchUpdates(updates: (() => void)[], callback?: () => void): void {
		// Use React's unstable_batchedUpdates if available
		if (
			typeof (window as TSAny).React?.unstable_batchedUpdates === "function"
		) {
			(window as TSAny).React.unstable_batchedUpdates(() => {
				updates.forEach((update) => update());
				callback?.();
			});
		} else {
			// Fallback to setTimeout batching
			setTimeout(() => {
				updates.forEach((update) => update());
				callback?.();
			}, 0);
		}
	}

	/**
	 * Optimize block rendering by filtering visible blocks
	 */
	static getVisibleBlocks(
		blocks: Block[],
		viewportTop: number,
		viewportBottom: number,
		itemHeight: number,
	): Block[] {
		const startIndex = Math.max(0, Math.floor(viewportTop / itemHeight));
		const endIndex = Math.min(
			blocks.length - 1,
			Math.ceil(viewportBottom / itemHeight),
		);

		return blocks.slice(startIndex, endIndex + 1);
	}

	/**
	 * Calculate optimal item height based on content
	 */
	static calculateItemHeight(block: Block): number {
		const baseHeight = 24; // Base line height
		const contentLines = block.content.split("\n").length;
		const typeMultiplier = this.getTypeMultiplier(block.type);

		return Math.max(baseHeight * contentLines * typeMultiplier, 40);
	}

	/**
	 * Get type-specific height multiplier
	 */
	private static getTypeMultiplier(type: Block["type"]): number {
		switch (type) {
			case "heading1":
				return 1.5;
			case "heading2":
				return 1.3;
			case "heading3":
				return 1.2;
			case "codeBlock":
				return 1.1;
			case "quote":
				return 1.1;
			case "checklist":
				return 1.0;
			default:
				return 1.0;
		}
	}

	/**
	 * Optimize selection updates
	 */
	static optimizeSelectionUpdate(
		currentSelection: TSAny,
		newSelection: TSAny,
	): boolean {
		if (!currentSelection && !newSelection) return false;
		if (!currentSelection || !newSelection) return true;

		return (
			currentSelection.blockId !== newSelection.blockId ||
			currentSelection.startOffset !== newSelection.startOffset ||
			currentSelection.endOffset !== newSelection.endOffset ||
			currentSelection.isCollapsed !== newSelection.isCollapsed
		);
	}

	/**
	 * Optimize block updates by checking if content actually changed
	 */
	static shouldUpdateBlock(oldBlock: Block, newBlock: Block): boolean {
		return (
			oldBlock.content !== newBlock.content ||
			oldBlock.type !== newBlock.type ||
			JSON.stringify(oldBlock.metadata) !== JSON.stringify(newBlock.metadata)
		);
	}

	/**
	 * Create a performance monitor for debugging
	 */
	static createPerformanceMonitor() {
		const metrics = {
			renderCount: 0,
			updateCount: 0,
			selectionCount: 0,
			lastRenderTime: 0,
		};

		return {
			metrics,
			startRender: () => {
				metrics.renderCount++;
				metrics.lastRenderTime = performance.now();
			},
			endRender: () => {
				const duration = performance.now() - metrics.lastRenderTime;
				if (duration > 16) {
					// Warn if render takes longer than one frame
					console.warn(`Slow render detected: ${duration}ms`);
				}
			},
			recordUpdate: () => {
				metrics.updateCount++;
			},
			recordSelection: () => {
				metrics.selectionCount++;
			},
			getMetrics: () => ({ ...metrics }),
		};
	}

	/**
	 * Implement intersection observer for lazy loading
	 */
	static createIntersectionObserver(
		callback: (entries: IntersectionObserverEntry[]) => void,
		options?: IntersectionObserverInit,
	): IntersectionObserver {
		return new IntersectionObserver(callback, {
			rootMargin: "100px",
			threshold: 0.1,
			...options,
		});
	}

	/**
	 * Optimize large document rendering
	 */
	static optimizeLargeDocument(
		blocks: Block[],
		threshold: number = 1000,
	): {
		shouldUseVirtualScrolling: boolean;
		chunkSize: number;
	} {
		const shouldUseVirtualScrolling = blocks.length > threshold;
		const chunkSize = Math.min(
			50,
			Math.max(10, Math.floor(blocks.length / 20)),
		);

		return {
			shouldUseVirtualScrolling,
			chunkSize,
		};
	}
}
