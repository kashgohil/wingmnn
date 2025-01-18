export default function Divider(props: React.HTMLAttributes<HTMLDivElement> & { color?: string; vertical?: boolean }) {
	const { className, children, color = 'black', vertical, ...rest } = props;

	if (vertical) {
		if (!children) {
			return (
				<div
					className={`relative h-full flex flex-col items-center ${className}`}
					{...rest}>
					<div
						className="flex-grow border-t"
						style={{ borderColor: color }}
					/>
				</div>
			);
		}

		return (
			<div
				className={`relative h-full flex flex-col items-center ${className}`}
				{...rest}>
				<div
					className="flex-grow border-t"
					style={{ borderColor: color }}
				/>
				<div className="flex-shrink mx-4">{children}</div>
				<div
					className="flex-grow border-t"
					style={{ borderColor: color }}
				/>
			</div>
		);
	}

	if (!children) {
		return (
			<div
				className={`relative w-full flex items-center ${className}`}
				{...rest}>
				<div
					className="flex-grow border-t"
					style={{ borderColor: color }}
				/>
			</div>
		);
	}

	return (
		<div
			className={`relative w-full flex items-center ${className}`}
			{...rest}>
			<div
				className="flex-grow border-t"
				style={{ borderColor: color }}
			/>
			<div className="flex-shrink mx-4">{children}</div>
			<div
				className="flex-grow border-t"
				style={{ borderColor: color }}
			/>
		</div>
	);
}
