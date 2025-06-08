/* eslint-disable react-refresh/only-export-components */
import { cx } from "@utility/cx";

export interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  as?: string;
}

function H1(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h1 {...rest} className={cx("text-3xl", className)}>
      {children}
    </h1>
  );
}

function H2(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h2 {...rest} className={cx("text-2xl", className)}>
      {children}
    </h2>
  );
}

function H3(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h3 {...rest} className={cx("text-xl", className)}>
      {children}
    </h3>
  );
}

function H4(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h4 {...rest} className={cx("text-lg", className)}>
      {children}
    </h4>
  );
}

function Text(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cx("text-base", className)}>
      {children}
    </span>
  );
}

function Paragraph(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <p {...rest} className={cx("text-base", className)}>
      {children}
    </p>
  );
}

function Caption(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cx("text-sm", className)}>
      {children}
    </span>
  );
}

export const Typography = {
  H1,
  H2,
  H3,
  H4,
  Text,
  Paragraph,
  Caption,
};
