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
    <h1 {...rest} className={cx(className, "text-3xl")}>
      {children}
    </h1>
  );
}

function H2(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h2 {...rest} className={cx(className, "text-2xl")}>
      {children}
    </h2>
  );
}

function H3(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h3 {...rest} className={cx(className, "text-xl")}>
      {children}
    </h3>
  );
}

function H4(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <h4 {...rest} className={cx(className, "text-lg")}>
      {children}
    </h4>
  );
}

function Text(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cx(className, "text-base")}>
      {children}
    </span>
  );
}

function Paragraph(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <p {...rest} className={cx(className, "text-base")}>
      {children}
    </p>
  );
}

function Caption(props: Props) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cx(className, "text-sm")}>
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
