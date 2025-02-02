export function classVariance<T extends MapOf<string>>(variance: T) {
	return (...variants: Array<keyof T>) => {
		let classnames = '';

		for (const variant of variants) {
			if (variance[variant]) {
				classnames += ' ' + variance[variant];
			}
		}
		return classnames;
	};
}
