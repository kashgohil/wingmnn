import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { Children } from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  content?: string;
  stroke?: number;
  contentClassName?: string;
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
    contentClassName,
    ...rest
  } = props;

  if (!children) {
    return (
      <div className={parentVariant(orientation)}>
        <div className={cx(variant(orientation), className)} {...rest}></div>
        {content ? (
          <>
            <div className={cx("mx-4", contentClassName)}>{content}</div>
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
            {index < count - 1 ? (
              <Separator
                content={content}
                className={className}
                orientation={orientation}
                contentClassName={contentClassName}
                {...rest}
              />
            ) : null}
          </>
        );
      })}
    </>
  );
}
