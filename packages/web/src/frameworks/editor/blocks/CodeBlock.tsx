import type { BlockProps } from "../types";
import { BaseBlock } from "./BaseBlock";

export function CodeBlock(props: BlockProps) {
	return (
		<div className="relative group">
			<BaseBlock
				{...props}
				className="font-mono text-sm bg-accent/10 p-4 rounded-lg border"
				placeholder="Enter code..."
				onKeyDown={(event) => {
					// Handle special key combinations for code blocks
					if (event.key === "Tab") {
						event.preventDefault();
						const selection = window.getSelection();
						if (selection && selection.rangeCount > 0) {
							const range = selection.getRangeAt(0);
							range.insertNode(document.createTextNode("  "));
						}
					}
				}}
			/>
			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					className="text-xs text-[var(--accent-text)] hover:text-primary px-2 py-1 bg-accent rounded border"
					onClick={() => {
						// Copy to clipboard functionality
						navigator.clipboard.writeText(props.block.content);
					}}
				>
					Copy
				</button>
			</div>
		</div>
	);
}
