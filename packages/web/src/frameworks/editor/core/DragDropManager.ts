import type { Block } from "../types";

export interface DragDropState {
	isDragging: boolean;
	draggedBlockId: string | null;
	dragOverBlockId: string | null;
	dragPosition: "above" | "below" | null;
}

export class DragDropManager {
	private state: DragDropState = {
		isDragging: false,
		draggedBlockId: null,
		dragOverBlockId: null,
		dragPosition: null,
	};

	private listeners: Set<(state: DragDropState) => void> = new Set();

	/**
	 * Start drag operation
	 */
	startDrag(blockId: string): void {
		this.state = {
			isDragging: true,
			draggedBlockId: blockId,
			dragOverBlockId: null,
			dragPosition: null,
		};
		this.notifyListeners();
	}

	/**
	 * Handle drag over
	 */
	handleDragOver(blockId: string, position: "above" | "below"): void {
		if (!this.state.isDragging) return;

		this.state.dragOverBlockId = blockId;
		this.state.dragPosition = position;
		this.notifyListeners();
	}

	/**
	 * Handle drag leave
	 */
	handleDragLeave(): void {
		if (!this.state.isDragging) return;

		this.state.dragOverBlockId = null;
		this.state.dragPosition = null;
		this.notifyListeners();
	}

	/**
	 * End drag operation
	 */
	endDrag(): DragDropState {
		const finalState = { ...this.state };
		this.state = {
			isDragging: false,
			draggedBlockId: null,
			dragOverBlockId: null,
			dragPosition: null,
		};
		this.notifyListeners();
		return finalState;
	}

	/**
	 * Get current drag state
	 */
	getState(): DragDropState {
		return { ...this.state };
	}

	/**
	 * Check if a block is being dragged
	 */
	isBlockDragging(blockId: string): boolean {
		return this.state.isDragging && this.state.draggedBlockId === blockId;
	}

	/**
	 * Check if a block is being dragged over
	 */
	isBlockDragOver(blockId: string): boolean {
		return (
			this.state.isDragging &&
			this.state.dragOverBlockId === blockId &&
			this.state.draggedBlockId !== blockId
		);
	}

	/**
	 * Get drag position for a block
	 */
	getDragPosition(blockId: string): "above" | "below" | null {
		if (this.state.dragOverBlockId === blockId) {
			return this.state.dragPosition;
		}
		return null;
	}

	/**
	 * Calculate drop index
	 */
	calculateDropIndex(
		blocks: Block[],
		targetBlockId: string,
		position: "above" | "below",
	): number {
		const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);
		if (targetIndex === -1) return -1;

		return position === "above" ? targetIndex : targetIndex + 1;
	}

	/**
	 * Subscribe to drag state changes
	 */
	subscribe(listener: (state: DragDropState) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * Notify listeners of state changes
	 */
	private notifyListeners(): void {
		this.listeners.forEach((listener) => listener(this.getState()));
	}

	/**
	 * Create drag handle element
	 */
	createDragHandle(blockId: string): HTMLElement {
		const handle = document.createElement("div");
		handle.className =
			"drag-handle opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600";
		handle.innerHTML = `
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
			</svg>
		`;
		handle.draggable = true;

		handle.addEventListener("dragstart", (e) => {
			e.dataTransfer?.setData("text/plain", blockId);
			e.dataTransfer!.effectAllowed = "move";
			this.startDrag(blockId);
		});

		handle.addEventListener("dragend", () => {
			this.endDrag();
		});

		return handle;
	}

	/**
	 * Create drop zone element
	 */
	createDropZone(
		blockId: string,
		position: "above" | "below",
		onDrop: (
			sourceBlockId: string,
			targetBlockId: string,
			position: "above" | "below",
		) => void,
	): HTMLElement {
		const dropZone = document.createElement("div");
		dropZone.className = `drop-zone absolute left-0 right-0 h-1 bg-blue-500 opacity-0 transition-opacity ${
			position === "above" ? "-top-1" : "-bottom-1"
		}`;
		dropZone.setAttribute("data-block-id", blockId);
		dropZone.setAttribute("data-position", position);

		dropZone.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.dataTransfer!.dropEffect = "move";
			this.handleDragOver(blockId, position);
			dropZone.classList.add("opacity-100");
		});

		dropZone.addEventListener("dragleave", () => {
			this.handleDragLeave();
			dropZone.classList.remove("opacity-100");
		});

		dropZone.addEventListener("drop", (e) => {
			e.preventDefault();
			const sourceBlockId = e.dataTransfer?.getData("text/plain");
			if (sourceBlockId && sourceBlockId !== blockId) {
				onDrop(sourceBlockId, blockId, position);
			}
			dropZone.classList.remove("opacity-100");
		});

		return dropZone;
	}

	/**
	 * Setup drag and drop for a block container
	 */
	setupBlockDragDrop(
		container: HTMLElement,
		blockId: string,
		onMove: (
			sourceBlockId: string,
			targetBlockId: string,
			position: "above" | "below",
		) => void,
	): () => void {
		// Add drag handle
		const dragHandle = this.createDragHandle(blockId);
		container.appendChild(dragHandle);

		// Add drop zones
		const dropZoneAbove = this.createDropZone(blockId, "above", onMove);
		const dropZoneBelow = this.createDropZone(blockId, "below", onMove);

		container.style.position = "relative";
		container.appendChild(dropZoneAbove);
		container.appendChild(dropZoneBelow);

		// Add visual feedback classes
		container.classList.add("group", "relative");

		// Handle drag state changes
		const unsubscribe = this.subscribe((state) => {
			if (state.isDragging && state.draggedBlockId === blockId) {
				container.classList.add("opacity-50", "scale-95");
			} else {
				container.classList.remove("opacity-50", "scale-95");
			}

			if (this.isBlockDragOver(blockId)) {
				container.classList.add("ring-2", "ring-blue-300");
			} else {
				container.classList.remove("ring-2", "ring-blue-300");
			}
		});

		// Cleanup function
		return () => {
			unsubscribe();
			container.removeChild(dragHandle);
			container.removeChild(dropZoneAbove);
			container.removeChild(dropZoneBelow);
		};
	}
}
