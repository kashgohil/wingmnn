import { type CSSProperties } from "react";
import { cn } from "../../lib/utils";

type RetroGridPatternProps = {
	className?: string;
	backgroundSize?: number | string;
	lineColor?: string;
	innerStyleOverrides?: CSSProperties;
};

const createBackgroundSize = (size: number | string | undefined) => {
	if (typeof size === "number") {
		return `${size}px ${size}px`;
	}
	return size ?? "20px 20px";
};

const createPattern = (color: string) => `
	linear-gradient(${color} 1px, transparent 1px),
	linear-gradient(90deg, ${color} 1px, transparent 1px)
`;

function RetroGridBase({
	className,
	backgroundSize,
	lineColor = "var(--border)",
	innerStyleOverrides,
	defaultClassName,
}: RetroGridPatternProps & { defaultClassName: string }) {
	return (
		<div
			className={cn(defaultClassName, className)}
			aria-hidden="true"
			data-slot="retro-grid-pattern"
		>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: createPattern(lineColor),
					backgroundSize: createBackgroundSize(backgroundSize),
					...innerStyleOverrides,
				}}
			/>
		</div>
	);
}

export function RetroGridOverlay(props: RetroGridPatternProps) {
	return (
		<RetroGridBase
			defaultClassName="absolute inset-0 pointer-events-none"
			{...props}
			backgroundSize={props.backgroundSize ?? "20px 20px"}
		/>
	);
}

export function SoftRetroGridBackground(props: RetroGridPatternProps) {
	return (
		<RetroGridBase
			defaultClassName="absolute inset-0 pointer-events-none"
			{...props}
			backgroundSize={props.backgroundSize ?? "40px 40px"}
		/>
	);
}
