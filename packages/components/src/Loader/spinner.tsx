import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";

interface SpinnerProps {
  variant?: "border" | "circle" | "dots" | "pulse";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  thickness?: "thin" | "normal" | "thick";
}

const variants = classVariance({
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",

  thin: "border-2",
  normal: "border-4",
  thick: "border-8",
});

// Spinner component with variants and customizable props
export function Spinner(props: SpinnerProps) {
  const { variant = "border", size = "md", thickness = "normal" } = props;

  switch (variant) {
    case "circle":
      return (
        <div
          className={cx(
            variants(size, thickness),
            "rounded-full border-t-transparent border-b-transparent animate-spin",
          )}
        ></div>
      );
    case "dots":
      return (
        <div
          className={cx(
            variants(size, thickness),
            "flex space-x-1 items-center",
          )}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cx("rounded-full w-1/4 h-1/4 animate-bounce")}
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      );
    case "pulse":
      return (
        <div className={cx(variants(size, thickness), "relative")}>
          <div
            className={cx(
              "absolute inset-0 rounded-full opacity-75 animate-ping",
            )}
          ></div>
          <div
            className={cx(
              "relative rounded-full w-1/2 h-1/2 mx-auto my-auto top-1/4",
            )}
          ></div>
        </div>
      );
    case "border":
    default:
      return (
        <div
          className={cx(
            variants(size, thickness),
            "border-t-transparent rounded-full animate-spin",
          )}
        ></div>
      );
  }
}
