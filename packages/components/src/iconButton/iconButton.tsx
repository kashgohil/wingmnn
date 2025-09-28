import { Button, type ButtonProps } from "@components/button/button";
import { cx } from "@utility/cx";
import { type LucideProps } from "lucide-react";

export interface IconButtonProps extends ButtonProps {
  icon: React.JSXElementConstructor<LucideProps>;
  shape?: "circle" | "rounded" | "square";
  iconProps?: LucideProps;
  className?: string;
}

export function IconButton(props: IconButtonProps) {
  const {
    icon: Icon,
    shape = "rounded",
    iconProps = {},
    className,
    ...rest
  } = props;

  if (!Icon) return null;

  if (shape === "circle") {
    return (
      <Button
        {...rest}
        variant="icon"
        className={cx(
          "flex items-center justify-center rounded-full",
          className,
        )}
      >
        <Icon {...iconProps} />
      </Button>
    );
  }

  if (shape === "rounded") {
    return (
      <Button
        {...rest}
        variant="icon"
        className={cx("flex items-center justify-center rounded-lg", className)}
      >
        <Icon {...iconProps} />
      </Button>
    );
  }

  if (shape === "square") {
    return (
      <Button
        {...rest}
        variant="icon"
        className={cx(
          "flex items-center justify-center rounded-none",
          className,
        )}
      >
        <Icon {...iconProps} />
      </Button>
    );
  }
}
