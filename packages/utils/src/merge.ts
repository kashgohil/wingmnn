import { forEachObj } from "./forEach";

const isPlainObject = (obj: any) => Object.prototype.toString.call(obj) === "[object Object]";

export function merge<T>(...objects: MapOf<TSAny>[]): T {
	if (objects.length === 0) {
		return {} as T;
	}

	if (objects.length === 1) {
		return objects[0] as T;
	}

	return objects.reduce((acc, obj) => {
		forEachObj(obj, (value, key) => {
			if (Array.isArray(value)) {
				// If target value isn't already an array, initialize it.
				if (!Array.isArray(acc[key])) {
					acc[key] = [];
				}
				// Concatenate arrays.
				acc[key] = [...acc[key], ...value];
			} else if (value instanceof Set) {
				// If target isn't a set, initialize it.
				if (!(acc[key] instanceof Set)) {
					acc[key] = new Set();
				}
				// Merge by adding all elements.
				value.forEach((item: any) => (acc[key] as Set<any>).add(item));
			} else if (isPlainObject(value)) {
				// If target property is not a plain object, default it to {}.
				acc[key] = merge(isPlainObject(acc[key]) ? acc[key] : {}, value);
			} else {
				// For primitives, functions, dates, etc.
				acc[key] = value;
			}
		});
		return acc;
	}, {} as MapOf<TSAny>) as T;
}
