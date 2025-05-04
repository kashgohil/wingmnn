import { cx } from "@utility/cx";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function Box(props: BoxProps) {
  const { className = "", children, ...rest } = props;

  return (
    <div className={cx("shadow-sm rounded-lg", className)} {...rest}>{children}
    </div>
  );
}
