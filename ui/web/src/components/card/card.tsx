import { Link } from "@frameworks/router/Link";
import { cx } from "@utility/cx";
import { HTMLMotionProps, motion, TargetAndTransition } from "motion/react";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  to?: string;
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

export function Card(props: CardProps) {
  const { className, to, children, whileHover = {}, ...rest } = props;

  function content() {
    return (
      <motion.div
        {...rest}
        className={cx(className)}
        whileHover={{ translateY: -5, ...whileHover }}
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
