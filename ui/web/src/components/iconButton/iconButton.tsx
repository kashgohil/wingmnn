import { Button, ButtonProps } from "@components/button/button";
import { LucideProps } from "lucide-react";

export interface IconButtonProps extends ButtonProps {
  icon: React.JSXElementConstructor<LucideProps>;
  shape?: "circle" | "rounded" | "square";
}

export function IconButton(props: IconButtonProps) {
  const { icon: Icon, shape = "rounded", ...rest } = props;

  if (!Icon) return null;

  if (shape === "circle") {
    return (
      <Button
        {...rest}
        className="flex items-center justify-center rounded-full"
      >
        <Icon />
      </Button>
    );
  }

  if (shape === "rounded") {
    return (
      <Button {...rest} className="flex items-center justify-center rounded-lg">
        <Icon />
      </Button>
    );
  }

  if (shape === "square") {
    return (
      <Button
        {...rest}
        className="flex items-center justify-center rounded-none"
      >
        <Icon />
      </Button>
    );
  }
}
