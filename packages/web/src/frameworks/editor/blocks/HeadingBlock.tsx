import type { BlockProps } from "../types";
import { BaseBlock } from "./BaseBlock";

interface HeadingBlockProps extends BlockProps {
	level: 1 | 2 | 3 | 4 | 5 | 6;
}

export function HeadingBlock({ level, ...props }: HeadingBlockProps) {
	const getHeadingStyles = () => {
		switch (level) {
			case 1:
				return "text-3xl font-bold leading-tight";
			case 2:
				return "text-2xl font-bold leading-tight";
			case 3:
				return "text-xl font-semibold leading-tight";
			case 4:
				return "text-lg font-semibold leading-tight";
			case 5:
				return "text-base font-semibold leading-tight";
			case 6:
				return "text-sm font-semibold leading-tight";
			default:
				return "text-base font-semibold leading-tight";
		}
	};

	const getPlaceholder = () => {
		switch (level) {
			case 1:
				return "Heading 1";
			case 2:
				return "Heading 2";
			case 3:
				return "Heading 3";
			case 4:
				return "Heading 4";
			case 5:
				return "Heading 5";
			case 6:
				return "Heading 6";
			default:
				return "Heading";
		}
	};

	return (
		<BaseBlock
			{...props}
			className={getHeadingStyles()}
			placeholder={getPlaceholder()}
		/>
	);
}
