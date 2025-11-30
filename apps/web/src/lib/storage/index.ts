/**
 * Storage Module
 *
 * Exports all storage-related utilities and managers
 */

export {
	LocalStorageManager,
	LocalStorageManagerImpl,
	localStorageManager,
	type LocalStorageManager as ILocalStorageManager,
} from "./local-storage-manager";

export { createTableStore, type TableStore } from "./table-storage";
