import { Button, ButtonProps } from "@components/button/button";
import { cx } from "@utility/cx";
import { LucideProps } from "lucide-react";

export interface IconButtonProps extends ButtonProps {
  icon: React.JSXElementConstructor<LucideProps>;
  shape?: "circle" | "rounded" | "square";
  iconProps?: LucideProps;
}

export function IconButton(props: IconButtonProps) {
  const { icon: Icon, shape = "rounded", className, ...rest } = props;

  if (!Icon) return null;

  if (shape === "circle") {
    return (
      <Button
        {...rest}
        className={cx(
          "flex items-center justify-center rounded-full",
          className,
        )}
      >
        <Icon {...props.iconProps} />
      </Button>
    );
  }

  if (shape === "rounded") {
    return (
      <Button
        {...rest}
        className={cx("flex items-center justify-center rounded-lg", className)}
      >
        <Icon {...props.iconProps} />
      </Button>
    );
  }

  if (shape === "square") {
    return (
      <Button
        {...rest}
        className={cx(
          "flex items-center justify-center rounded-none",
          className,
        )}
      >
        <Icon {...props.iconProps} />
      </Button>
    );
  }
}
