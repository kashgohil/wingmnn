import type { BlockProps } from "../types";
import { BaseBlock } from "./BaseBlock";

export function QuoteBlock(props: BlockProps) {
	return (
		<div className="border-l-4 border-accent/20 pl-4 italic text-accent">
			<BaseBlock
				{...props}
				className="text-base leading-relaxed"
				placeholder="Quote"
			/>
		</div>
	);
}
