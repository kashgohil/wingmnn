import type { EditorState } from "../types";

export interface AutoSaveOptions {
	enabled: boolean;
	interval: number; // in milliseconds
	maxRetries: number;
	storageKey: string;
	onSave: (state: EditorState) => Promise<void>;
	onLoad: () => Promise<EditorState | null>;
	onError: (error: Error) => void;
}

export class AutoSaveManager {
	private options: AutoSaveOptions;
	private saveTimer: NodeJS.Timeout | null = null;
	private retryCount = 0;
	private lastSavedState: EditorState | null = null;
	private isSaving = false;

	constructor(options: AutoSaveOptions) {
		this.options = options;
	}

	/**
	 * Start auto-save
	 */
	start(): void {
		if (!this.options.enabled) return;

		this.saveTimer = setInterval(() => {
			this.performAutoSave();
		}, this.options.interval);
	}

	/**
	 * Stop auto-save
	 */
	stop(): void {
		if (this.saveTimer) {
			clearInterval(this.saveTimer);
			this.saveTimer = null;
		}
	}

	/**
	 * Trigger immediate save
	 */
	async saveNow(state: EditorState): Promise<void> {
		await this.performAutoSave(state);
	}

	/**
	 * Check if state has changed since last save
	 */
	hasStateChanged(currentState: EditorState): boolean {
		if (!this.lastSavedState) return true;

		return (
			JSON.stringify(currentState.blocks) !==
				JSON.stringify(this.lastSavedState.blocks) ||
			currentState.selection !== this.lastSavedState.selection
		);
	}

	/**
	 * Perform auto-save
	 */
	private async performAutoSave(state?: EditorState): Promise<void> {
		if (this.isSaving) return;

		// If no state provided, we can't save
		if (!state) return;

		// Check if state has changed
		if (!this.hasStateChanged(state)) return;

		this.isSaving = true;

		try {
			await this.options.onSave(state);
			this.lastSavedState = { ...state };
			this.retryCount = 0;
		} catch (error) {
			this.handleSaveError(error as Error);
		} finally {
			this.isSaving = false;
		}
	}

	/**
	 * Handle save errors with retry logic
	 */
	private handleSaveError(error: Error): void {
		this.retryCount++;

		if (this.retryCount <= this.options.maxRetries) {
			// Retry after exponential backoff
			const retryDelay = Math.pow(2, this.retryCount) * 1000;
			setTimeout(() => {
				this.performAutoSave();
			}, retryDelay);
		} else {
			// Max retries exceeded
			this.options.onError(error);
			this.retryCount = 0;
		}
	}

	/**
	 * Load saved state
	 */
	async loadSavedState(): Promise<EditorState | null> {
		try {
			return await this.options.onLoad();
		} catch (error) {
			this.options.onError(error as Error);
			return null;
		}
	}

	/**
	 * Save to localStorage
	 */
	static createLocalStorageSave(storageKey: string): AutoSaveOptions["onSave"] {
		return async (state: EditorState) => {
			const serialized = JSON.stringify(state);
			localStorage.setItem(storageKey, serialized);
		};
	}

	/**
	 * Load from localStorage
	 */
	static createLocalStorageLoad(storageKey: string): AutoSaveOptions["onLoad"] {
		return async (): Promise<EditorState | null> => {
			const serialized = localStorage.getItem(storageKey);
			if (!serialized) return null;

			try {
				return JSON.parse(serialized);
			} catch {
				return null;
			}
		};
	}

	/**
	 * Save to server
	 */
	static createServerSave(
		url: string,
		headers?: Record<string, string>,
	): AutoSaveOptions["onSave"] {
		return async (state: EditorState) => {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...headers,
				},
				body: JSON.stringify(state),
			});

			if (!response.ok) {
				throw new Error(`Save failed: ${response.statusText}`);
			}
		};
	}

	/**
	 * Load from server
	 */
	static createServerLoad(
		url: string,
		headers?: Record<string, string>,
	): AutoSaveOptions["onLoad"] {
		return async (): Promise<EditorState | null> => {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...headers,
				},
			});

			if (!response.ok) {
				throw new Error(`Load failed: ${response.statusText}`);
			}

			return response.json();
		};
	}

	/**
	 * Create default auto-save options
	 */
	static createDefaultOptions(
		storageKey: string = "editor-autosave",
	): Partial<AutoSaveOptions> {
		return {
			enabled: true,
			interval: 5000, // 5 seconds
			maxRetries: 3,
			storageKey,
			onSave: AutoSaveManager.createLocalStorageSave(storageKey),
			onLoad: AutoSaveManager.createLocalStorageLoad(storageKey),
			onError: (error) => console.error("Auto-save error:", error),
		};
	}

	/**
	 * Get save status
	 */
	getStatus(): {
		isSaving: boolean;
		retryCount: number;
		lastSaved: Date | null;
	} {
		return {
			isSaving: this.isSaving,
			retryCount: this.retryCount,
			lastSaved: this.lastSavedState ? new Date() : null,
		};
	}

	/**
	 * Clear saved state
	 */
	async clearSavedState(): Promise<void> {
		try {
			await this.options.onSave({
				blocks: [],
				selection: null,
				history: [],
				historyIndex: -1,
			});
			this.lastSavedState = null;
		} catch (error) {
			this.options.onError(error as Error);
		}
	}
}
