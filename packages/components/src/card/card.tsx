import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { Link } from "@wingmnn/router";
import { playClickSound } from "@wingmnn/utils/interactivity";
import { type HTMLMotionProps, motion } from "motion/react";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  to?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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

interface CardImageProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  picture: string;
  alt: string;
  pictureClassName?: string;
  pictureStyle?: React.CSSProperties;
}

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
        className={cx(
          "rounded-xl p-4 focus-within:outline-accent/50 outline-offset-6 transition-all duration-200 active:translate-y-0.5",
          variants(size),
          className,
        )}
      >
        {children}
      </motion.div>
    );
  }

  if (to) {
    return (
      <Link onClick={playClickSound} to={to} tabIndex={-1}>
        {content()}
      </Link>
    );
  }

  return content();
}

export function CardTitle(props: CardTitleProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-1", className)}>
      {children}
    </div>
  );
}

export function CardContent(props: CardContentProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-1", className)}>
      {children}
    </div>
  );
}

export function CardImage(props: CardImageProps) {
  const { className, picture, alt, pictureClassName, pictureStyle, ...rest } =
    props;
  return (
    <div {...rest} className={cx("", className)}>
      <img
        alt={alt}
        src={picture}
        className={cx("w-full h-full", pictureClassName)}
        style={pictureStyle}
      />
    </div>
  );
}

export function CardFooter(props: CardFooterProps) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={cx("px-4 py-1", className)}>
      {children}
    </div>
  );
}
