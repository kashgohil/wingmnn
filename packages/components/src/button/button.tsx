import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const variantClasses = classVariance({
  primary:
    "bg-black-500 text-white-500 hover:bg-black-300 focus-within:outline-white-400",
  secondary:
    "bg-white-400 text-black-400 hover:bg-white-700 focus-within:outline-white-400",
  sm: "px-4 py-2",
  md: "px-8 py-4",
  lg: "px-12 py-8",
});

export function Button(props: ButtonProps) {
  const {
    children,
    className,
    size = "md",
    variant = "primary",
    ...rest
  } = props;

  return (
    <button
      {...rest}
      className={cx(
        "rounded-lg active:translate-y-0.5 transition-all duration-200 cursor-pointer focus-within:outline-2 outline-offset-2",
        variantClasses(variant, size),
        className,
      )}
    >
      {children}
    </button>
  );
}
