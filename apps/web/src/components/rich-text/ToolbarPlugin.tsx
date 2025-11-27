import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	UNDO_COMMAND,
} from "lexical";

import { cn } from "@/lib/utils";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
	$isListNode,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	Bold,
	Italic,
	Link,
	List as ListIcon,
	ListOrdered,
	Redo2,
	Underline,
	Undo2,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "../ui/button";

type BlockType = "paragraph" | "number" | "bullet";

export function ToolbarPlugin({
	toolbarClassName,
}: {
	toolbarClassName?: string;
}) {
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
					parent.getTag() === "ol"
						? ("number" as BlockType)
						: ("bullet" as BlockType),
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
			type === "number"
				? INSERT_ORDERED_LIST_COMMAND
				: INSERT_UNORDERED_LIST_COMMAND,
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
		<div
			className={cn(
				"flex flex-wrap items-center gap-1.5 border-b-2 border-border px-3 py-2",
				toolbarClassName,
			)}
		>
			<ToggleButton
				ariaLabel="Bold"
				active={isBold}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
			>
				<Bold className="h-2 w-2" />
			</ToggleButton>
			<ToggleButton
				ariaLabel="Italic"
				active={isItalic}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
			>
				<Italic className="h-2 w-2" />
			</ToggleButton>
			<ToggleButton
				ariaLabel="Underline"
				active={isUnderline}
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
			>
				<Underline className="h-2 w-2" />
			</ToggleButton>
			<span className="mx-1 h-6 w-px bg-border/60" />
			<ToggleButton
				ariaLabel="Bulleted list"
				active={blockType === "bullet"}
				onClick={() => toggleList("bullet")}
			>
				<ListIcon className="h-2 w-2" />
			</ToggleButton>
			<ToggleButton
				ariaLabel="Numbered list"
				active={blockType === "number"}
				onClick={() => toggleList("number")}
			>
				<ListOrdered className="h-2 w-2" />
			</ToggleButton>
			<ToggleButton
				ariaLabel="Insert link"
				active={isLink}
				onClick={toggleLink}
			>
				<Link className="h-2 w-2" />
			</ToggleButton>
			<span className="mx-1 h-6 w-px bg-border/60" />
			<ToggleButton
				ariaLabel="Undo"
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
			>
				<Undo2 className="h-2 w-2" />
			</ToggleButton>
			<ToggleButton
				ariaLabel="Redo"
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
			>
				<Redo2 className="h-2 w-2" />
			</ToggleButton>
		</div>
	);
}

interface ToggleButtonProps {
	children: ReactNode;
	onClick: () => void;
	active?: boolean;
	ariaLabel: string;
	className?: string;
}

function ToggleButton({
	children,
	onClick,
	active = false,
	ariaLabel,
}: ToggleButtonProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			onClick={onClick}
			aria-label={ariaLabel}
			aria-pressed={active}
		>
			{children}
		</Button>
	);
}
