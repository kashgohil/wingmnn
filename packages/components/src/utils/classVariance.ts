export function classVariance<T extends MapOf<string>>(variance: T) {
  return (...variants: Array<keyof T | undefined>) => {
    let classnames = "";

    for (const variant of variants) {
      if (variant && variance[variant]) {
        classnames += " " + variance[variant];
      }
    }
    return classnames;
  };
}
