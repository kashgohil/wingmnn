import { forEachObj } from './forEach';

export function merge<T>(...objects: MapOf<TSAny>[]): T | undefined {
	if (objects.length === 0) {
		return undefined;
	}

	if (objects.length === 1) {
		return objects[0] as T;
	}

	// do a deep merge here
	return objects.reduce((acc, obj) => {
		forEachObj(obj, (value, key) => {
			if (typeof value === 'object') {
				acc[key] = merge(acc[key], value);
			} else {
				acc[key] = value;
			}
		});
		return acc;
	}, {} as MapOf<TSAny>) as T;
}
