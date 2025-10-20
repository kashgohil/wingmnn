interface Props {
	children: React.ReactNode;
}

export function Finance(props: Props) {
	const { children } = props;

	return <div className="flex flex-col h-full">{children}</div>;
}
