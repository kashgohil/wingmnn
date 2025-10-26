import { withClickSound } from "@wingmnn/utils/interactivity";

import { Slot } from "@radix-ui/react-slot";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import * as React from "react";

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "icon" | "stripped";
  size?: "sm" | "md" | "lg";
  noSound?: boolean;
  asChild?: boolean;
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

export function Button({
  className,
  variant = "primary",
  size = "sm",
  noSound,
  onClick,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cx(
        "rounded-lg active:translate-y-0.5 transition-all cursor-pointer focus-within:outline-2 outline-offset-2 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 aria-invalid:border-destructive",
        variantClasses(variant, size),
        className,
      )}
      {...props}
      onClick={noSound ? onClick : withClickSound(onClick)}
    />
  );
}
