import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { Link } from "@wingmnn/router";
import {
  type HTMLMotionProps,
  motion,
  type TargetAndTransition,
} from "motion/react";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  to?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  whileHover?: TargetAndTransition;
}

type CardTitleProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type CardContentProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type CardFooterProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const variants = classVariance({
  xs: "w-60",
  sm: "w-90",
  md: "w-120",
  lg: "w-150",
  xl: "w-180",
});

export function Card(props: CardProps) {
  const { className, to, children, size = "md", ...rest } = props;

  function content() {
    return (
      <motion.div
        {...rest}
        className={cx("rounded-xl p-4", variants(size), className)}
      >
        {children}
      </motion.div>
    );
  }

  if (to) {
    <Link to={to} tabIndex={-1}>
      {content()}
    </Link>;
  }

  return content();
}

export function CardTitle(props: CardTitleProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-3", className)}>
      {children}
    </div>
  );
}

export function CardContent(props: CardContentProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-3", className)}>
      {children}
    </div>
  );
}

export function CardFooter(props: CardFooterProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-3", className)}>
      {children}
    </div>
  );
}
