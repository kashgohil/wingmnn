import { Button, ButtonProps } from "@components/button/button";

export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  shape?: "circle" | "rounded" | "square";
}

export function IconButton(props: IconButtonProps) {
  const { icon, shape = "circle", ...rest } = props;

  if (shape === "circle") {
    return (
      <Button
        {...rest}
        className="flex items-center justify-center rounded-full"
      >
        {icon}
      </Button>
    );
  }

  if (shape === "rounded") {
    return (
      <Button {...rest} className="flex items-center justify-center rounded-md">
        {icon}
      </Button>
    );
  }

  if (shape === "square") {
    return (
      <Button
        {...rest}
        className="flex items-center justify-center rounded-none"
      >
        {icon}
      </Button>
    );
  }
}
