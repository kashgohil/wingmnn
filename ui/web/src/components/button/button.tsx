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
  primary: "bg-black-500 text-white-100 hover:bg-black-300",
  secondary: "bg-white-400 text-black-100 hover:bg-white-700",
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
        "rounded-lg active:translate-y-1 transition-all duration-200 cursor-pointer focus-within:outline-black-200 focus-within:outline-2 outline-offset-2",
        variantClasses(variant, size),
        className,
      )}
    >
      {children}
    </button>
  );
}
