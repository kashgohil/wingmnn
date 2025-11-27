import {
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	UNDO_COMMAND,
	$getSelection,
	$isRangeSelection,
} from "lexical";

import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
	$isListNode,
} from "@lexical/list";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	Bold,
	Italic,
	Link,
	List as ListIcon,
	ListOrdered,
	Underline,
	Undo2,
	Redo2,
} from "lucide-react";
import { useCallback, useEffect, useState, type ComponentType, type SVGProps } from "react";
import { cn } from "@/lib/utils";

type BlockType = "paragraph" | "number" | "bullet";

export function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [blockType, setBlockType] = useState<BlockType>("paragraph");

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return;
		}

		setIsBold(selection.hasFormat("bold"));
		setIsItalic(selection.hasFormat("italic"));
		setIsUnderline(selection.hasFormat("underline"));

		const anchorNode = selection.anchor.getNode();
		const element =
			anchorNode.getKey() === "root"
				? anchorNode
				: anchorNode.getTopLevelElementOrThrow();
		if ($isListNode(element)) {
			const parent = element.getParent();
			if ($isListNode(parent)) {
				setBlockType(
					parent.getTag() === "ol" ? ("number" as BlockType) : ("bullet" as BlockType),
				);
			} else {
				setBlockType(
					element.getTag() === "ol"
						? ("number" as BlockType)
						: ("bullet" as BlockType),
				);
			}
		} else {
			setBlockType("paragraph");
		}

		const node = selection.anchor.getNode();
		const parent = node.getParent();
		setIsLink($isLinkNode(parent) || $isLinkNode(node));
	}, [editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateToolbar();
					return false;
				},
				1,
			),
		);
	}, [editor, updateToolbar]);

	const toggleList = (type: BlockType) => {
		if (type === blockType) {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
			return;
		}

		editor.dispatchCommand(
			type === "number" ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
			undefined,
		);
	};

	const toggleLink = () => {
		if (isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
			return;
		}

		const url = window.prompt("Enter URL");
		if (!url) {
			return;
		}

		editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
	};

	return (
		<div className="flex flex-wrap gap-1 border-b border-border/80 bg-muted/40 p-2">
			<ToolbarButton
				ariaLabel="Bold"
				active={isBold}
				icon={Bold}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
			/>
			<ToolbarButton
				ariaLabel="Italic"
				active={isItalic}
				icon={Italic}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
			/>
			<ToolbarButton
				ariaLabel="Underline"
				active={isUnderline}
				icon={Underline}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
			/>
			<span className="mx-1 h-6 w-px bg-border" />
			<ToolbarButton
				ariaLabel="Bulleted list"
				active={blockType === "bullet"}
				icon={ListIcon}
				onClick={() => toggleList("bullet")}
			/>
			<ToolbarButton
				ariaLabel="Numbered list"
				active={blockType === "number"}
				icon={ListOrdered}
				onClick={() => toggleList("number")}
			/>
			<ToolbarButton
				ariaLabel="Insert link"
				active={isLink}
				icon={Link}
				onClick={toggleLink}
			/>
			<span className="mx-1 h-6 w-px bg-border" />
			<ToolbarButton
				ariaLabel="Undo"
				icon={Undo2}
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
			/>
			<ToolbarButton
				ariaLabel="Redo"
				icon={Redo2}
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
			/>
		</div>
	);
}

interface ToolbarButtonProps {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	onClick: () => void;
	active?: boolean;
	ariaLabel: string;
}

function ToolbarButton({
	icon: Icon,
	onClick,
	active = false,
	ariaLabel,
}: ToolbarButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-sm transition-colors",
				"hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				active ? "bg-background text-foreground" : "text-muted-foreground",
			)}
			onClick={onClick}
			aria-pressed={active}
			aria-label={ariaLabel}
		>
			<Icon className="h-4 w-4" />
		</button>
	);
}

