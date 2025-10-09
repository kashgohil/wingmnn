import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { withClickSound } from "@wingmnn/utils/interactivity";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: "primary" | "secondary" | "icon" | "stripped";
  size?: "sm" | "md" | "lg";
  noSound?: boolean;
}

const variantClasses = classVariance({
  stripped: "!p-0",
  icon: "bg-transparent text-accent hover:bg-accent/10 focus-within:outline-accent",
  primary:
    "bg-accent text-[var(--accent-text)] hover:bg-accent/70 focus-within:outline-accent",
  secondary:
    "bg-transparent border border-accent/40 text-accent hover:bg-accent/10 focus-within:outline-accent",
  sm: "px-4 py-2",
  md: "px-8 py-4",
  lg: "px-12 py-8",
});

export function Button(props: ButtonProps) {
  const {
    children,
    className,
    size = "sm",
    onClick,
    variant = "primary",
    noSound = false,
    ...rest
  } = props;

  return (
    <button
      {...rest}
      onClick={noSound ? onClick : withClickSound(onClick)}
      className={cx(
        "rounded-lg active:translate-y-0.5 transition-all cursor-pointer focus-within:outline-2 outline-offset-2",
        variantClasses(variant, size),
        className,
      )}
    >
      {children}
    </button>
  );
}
