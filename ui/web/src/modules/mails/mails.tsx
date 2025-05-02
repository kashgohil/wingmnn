interface Props {
  children: React.ReactNode;
}

export function Mails(props: Props) {
  const { children } = props;

  return (
    <div className="flex h-full w-full">
      <div className="bg-black-200 w-[15%] h-full"></div>
      {children}
    </div>
  );
}
