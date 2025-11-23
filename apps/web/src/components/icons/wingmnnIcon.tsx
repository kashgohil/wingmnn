export function WingmnnIcon({
	color,
	className,
}: {
	color: string;
	className?: string;
}) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill={color}
			className={className || "h-6 w-6"}
		>
			<title>Wingmnn Logo</title>
			<path d="M2 3 L8 3 L12 12 L8 21 L2 21 Z" />
			<path d="M22 3 L16 3 L12 12 L16 21 L22 21 Z" />
		</svg>
	);
}
