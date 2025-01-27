export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button(props: ButtonProps) {
  const { children, ...rest } = props;

  return <button {...rest}>{children}</button>;
}
