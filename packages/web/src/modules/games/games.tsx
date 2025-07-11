interface Props {
  children: React.ReactNode;
}

export function Games(props: Props) {
  const { children } = props;

  return <div className="h-full w-full">{children}</div>;
}
