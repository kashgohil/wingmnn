import { twMerge } from "tailwind-merge";

export function cx(
  ...classnames: Array<string | Record<string, boolean> | undefined | null>
) {
  const result: Array<string> = [];
  classnames.forEach((classname) => {
    if (typeof classname === "string") {
      result.push(classname);
    }
    if (typeof classname === "object" && classname) {
      result.push(
        Object.keys(classname)
          .filter((key) => classname[key])
          .join(" "),
      );
    }
  });
  return twMerge(result);
}
