import type { Block, BlockProps } from "../types";
import { ChecklistBlock } from "./ChecklistBlock";
import { CodeBlock } from "./CodeBlock";
import { DividerBlock } from "./DividerBlock";
import { HeadingBlock } from "./HeadingBlock";
import { QuoteBlock } from "./QuoteBlock";
import { TextBlock } from "./TextBlock";

interface BlockRendererProps extends Omit<BlockProps, "block"> {
	block: Block;
}

export function BlockRenderer({
	block,
	isSelected,
	isFocused,
	onUpdate,
	onDelete,
	onFocus,
	onBlur,
}: BlockRendererProps) {
	const commonProps = {
		block,
		isSelected,
		isFocused,
		onUpdate,
		onDelete,
		onFocus,
		onBlur,
	};

	switch (block.type) {
		case "heading1":
			return (
				<HeadingBlock
					{...commonProps}
					level={1}
				/>
			);
		case "heading2":
			return (
				<HeadingBlock
					{...commonProps}
					level={2}
				/>
			);
		case "heading3":
			return (
				<HeadingBlock
					{...commonProps}
					level={3}
				/>
			);
		case "heading4":
			return (
				<HeadingBlock
					{...commonProps}
					level={4}
				/>
			);
		case "heading5":
			return (
				<HeadingBlock
					{...commonProps}
					level={5}
				/>
			);
		case "heading6":
			return (
				<HeadingBlock
					{...commonProps}
					level={6}
				/>
			);
		case "codeBlock":
			return <CodeBlock {...commonProps} />;
		case "quote":
			return <QuoteBlock {...commonProps} />;
		case "divider":
			return <DividerBlock />;
		case "checklist":
			return <ChecklistBlock {...commonProps} />;
		case "paragraph":
		default:
			return <TextBlock {...commonProps} />;
	}
}
