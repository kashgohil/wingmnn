import type { BlockProps } from "../types";
import { BaseBlock } from "./BaseBlock";

export function TextBlock(props: BlockProps) {
	return (
		<BaseBlock
			{...props}
			className="text-base leading-relaxed"
			placeholder="Type '/' for commands"
		/>
	);
}
