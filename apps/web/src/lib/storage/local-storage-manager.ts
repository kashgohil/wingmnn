/**
 * LocalStorage Manager
 *
 * Base class for managing localStorage operations with type safety and error handling.
 * Provides generic methods for storing, retrieving, and removing data from localStorage.
 */

export interface LocalStorageManager {
	/**
	 * Retrieves a value from localStorage by key
	 * @param key The storage key
	 * @returns The stored value as a string, or null if not found
	 */
	getItem(key: string): string | null;

	/**
	 * Stores a value in localStorage
	 * @param key The storage key
	 * @param value The value to store (will be converted to string)
	 */
	setItem(key: string, value: string): void;

	/**
	 * Removes a value from localStorage by key
	 * @param key The storage key
	 */
	removeItem(key: string): void;

	/**
	 * Clears all items from localStorage
	 */
	clear(): void;

	/**
	 * Retrieves and parses a JSON value from localStorage
	 * @param key The storage key
	 * @returns The parsed JSON value, or null if not found or parsing fails
	 */
	getJSON<T>(key: string): T | null;

	/**
	 * Stores a value as JSON in localStorage
	 * @param key The storage key
	 * @param value The value to store (will be JSON stringified)
	 */
	setJSON<T>(key: string, value: T): void;
}

/**
 * Base implementation of LocalStorageManager
 * Provides default implementations for all storage operations
 */
export class LocalStorageManagerImpl implements LocalStorageManager {
	/**
	 * The storage instance to use (defaults to localStorage)
	 * Can be overridden for testing or custom storage backends
	 */
	protected storage: Storage;

	constructor(storage: Storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)) {
		this.storage = storage;
	}

	/**
	 * Retrieves a value from localStorage by key
	 * @param key The storage key
	 * @returns The stored value as a string, or null if not found
	 */
	getItem(key: string): string | null {
		try {
			return this.storage.getItem(key);
		} catch (error) {
			console.warn(`Failed to get item from localStorage with key "${key}":`, error);
			return null;
		}
	}

	/**
	 * Stores a value in localStorage
	 * @param key The storage key
	 * @param value The value to store (will be converted to string)
	 */
	setItem(key: string, value: string): void {
		try {
			this.storage.setItem(key, value);
		} catch (error) {
			console.warn(`Failed to set item in localStorage with key "${key}":`, error);
		}
	}

	/**
	 * Removes a value from localStorage by key
	 * @param key The storage key
	 */
	removeItem(key: string): void {
		try {
			this.storage.removeItem(key);
		} catch (error) {
			console.warn(`Failed to remove item from localStorage with key "${key}":`, error);
		}
	}

	/**
	 * Clears all items from localStorage
	 */
	clear(): void {
		try {
			this.storage.clear();
		} catch (error) {
			console.warn("Failed to clear localStorage:", error);
		}
	}

	/**
	 * Retrieves and parses a JSON value from localStorage
	 * @param key The storage key
	 * @returns The parsed JSON value, or null if not found or parsing fails
	 */
	getJSON<T>(key: string): T | null {
		const data = this.getItem(key);
		if (!data) return null;

		try {
			return JSON.parse(data) as T;
		} catch (error) {
			console.warn(`Failed to parse JSON from localStorage with key "${key}":`, error);
			return null;
		}
	}

	/**
	 * Stores a value as JSON in localStorage
	 * @param key The storage key
	 * @param value The value to store (will be JSON stringified)
	 */
	setJSON<T>(key: string, value: T): void {
		try {
			const jsonString = JSON.stringify(value);
			this.setItem(key, jsonString);
		} catch (error) {
			console.warn(`Failed to stringify JSON for localStorage with key "${key}":`, error);
		}
	}
}

/**
 * Default singleton instance of LocalStorageManager
 */
export const localStorageManager = new LocalStorageManagerImpl();

