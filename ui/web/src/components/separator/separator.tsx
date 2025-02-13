import { Children } from "react";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  content?: string;
  stroke?: number;
}

const variant = classVariance({
  vertical: "w-[2px] flex-1 bg-black",
  horizontal: "h-[2px] flex-1 bg-black",
});

const parentVariant = classVariance({
  horizontal: "flex items-center w-full",
  vertical: "flex flex-col items-center h-full",
});

export function Separator(props: SeparatorProps) {
  const {
    children,
    content,
    className,
    orientation = "horizontal",
    ...rest
  } = props;

  if (!children) {
    return (
      <div className={parentVariant(orientation)}>
        <div className={cx(variant(orientation), className)} {...rest}></div>
        {content ? (
          <>
            <div className="mx-4">{content}</div>
            <div
              className={cx(variant(orientation), className)}
              {...rest}
            ></div>
          </>
        ) : null}
      </div>
    );
  }

  const count = Children.count(children);
  return (
    <>
      {Children.map(children, (child, index) => {
        return (
          <>
            {child}
            {index < count ? <Separator {...props} /> : null}
          </>
        );
      })}
    </>
  );
}
