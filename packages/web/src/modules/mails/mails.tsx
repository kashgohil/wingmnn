interface Props {
  children: React.ReactNode;
}

export function Mails(props: Props) {
  const { children } = props;

  return <div className="flex h-full w-full">{children}</div>;
}
