export function cx(...classnames: Array<string | Record<string, boolean>>) {
  const result: Array<string> = [];
  classnames.forEach((classnames) => {
    if (typeof classnames === "string") {
      result.push(classnames);
    }
    if (typeof classnames === "object") {
      result.push(
        Object.keys(classnames)
          .filter((key) => classnames[key])
          .join(" "),
      );
    }
  });
  return result.join(" ");
}
