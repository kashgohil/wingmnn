/**
 * Storage Module
 *
 * Exports all storage-related utilities and managers
 */

export {
	LocalStorageManager,
	localStorageManager,
	LocalStorageManagerImpl,
	type LocalStorageManager as ILocalStorageManager,
} from "./local-storage-manager";

export { createTableStorage, type TableStorage } from "./table-storage";
