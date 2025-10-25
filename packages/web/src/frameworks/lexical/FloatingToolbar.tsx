import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createHeadingNode,
	$createQuoteNode,
	type HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { Button, IconButton, Separator } from "@wingmnn/components";
import {
	Bold,
	Brush,
	Code,
	Divide,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link,
	Palette,
	Quote,
	Strikethrough,
	Underline,
	type LucideIcon,
} from "@wingmnn/components/icons";
import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect, useRef, useState } from "react";

interface ToolbarButton {
	id: string;
	label: string;
	icon: LucideIcon;
	command: () => void;
	isActive: boolean;
	disabled?: boolean;
}

export function LexicalFloatingToolbar() {
	const [editor] = useLexicalComposerContext();
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [isHeading1, setIsHeading1] = useState(false);
	const [isHeading2, setIsHeading2] = useState(false);
	const [isHeading3, setIsHeading3] = useState(false);
	const [isQuote, setIsQuote] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [currentTextColor, setCurrentTextColor] = useState("#000000");

	const toolbarRef = useRef<HTMLDivElement>(null);

	const updateToolbar = () => {
		editor.getEditorState().read(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				// Update button states
				setIsBold(selection.hasFormat("bold"));
				setIsItalic(selection.hasFormat("italic"));
				setIsUnderline(selection.hasFormat("underline"));
				setIsStrikethrough(selection.hasFormat("strikethrough"));
				setIsCode(selection.hasFormat("code"));

				// Check block node types
				const anchorNode = selection.anchor.getNode();
				const focusNode = selection.focus.getNode();

				// Find the parent block node
				const getBlockNode = (node: TSAny) => {
					let currentNode = node;
					while (currentNode && currentNode.getType() !== "root") {
						if (
							currentNode.getType() === "heading" ||
							currentNode.getType() === "quote"
						) {
							return currentNode;
						}
						currentNode = currentNode.getParent();
					}
					return null;
				};

				const blockNode = getBlockNode(anchorNode) || getBlockNode(focusNode);

				if (blockNode) {
					if (blockNode.getType() === "heading") {
						const tag = blockNode.getTag();
						setIsHeading1(tag === "h1");
						setIsHeading2(tag === "h2");
						setIsHeading3(tag === "h3");
						setIsQuote(false);
					} else if (blockNode.getType() === "quote") {
						setIsHeading1(false);
						setIsHeading2(false);
						setIsHeading3(false);
						setIsQuote(true);
					}
				} else {
					setIsHeading1(false);
					setIsHeading2(false);
					setIsHeading3(false);
					setIsQuote(false);
				}

				// Show toolbar if there's a selection
				if (!selection.isCollapsed()) {
					const nativeSelection = window.getSelection();
					if (nativeSelection && nativeSelection.rangeCount > 0) {
						const range = nativeSelection.getRangeAt(0);
						const rect = range.getBoundingClientRect();

						const toolbarHeight = 40;
						const toolbarWidth = 300;

						let top = rect.top - toolbarHeight - 8;
						let left = rect.left + rect.width / 2;

						// Adjust if toolbar would go off screen
						const viewportWidth = window.innerWidth;

						if (left - toolbarWidth / 2 < 8) {
							left = 8 + toolbarWidth / 2;
						} else if (left + toolbarWidth / 2 > viewportWidth - 8) {
							left = viewportWidth - 8 - toolbarWidth / 2;
						}

						if (top < 8) {
							top = rect.bottom + 8;
						}

						setPosition({ top, left });
						setIsVisible(true);
					}
				} else {
					setIsVisible(false);
				}
			} else {
				setIsVisible(false);
			}
		});
	};

	useEffect(() => {
		const removeUpdateListener = editor.registerUpdateListener(
			({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			},
		);

		const removeCommandListener = editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateToolbar();
				return false;
			},
			1,
		);

		return () => {
			removeUpdateListener();
			removeCommandListener();
		};
	}, [editor]);

	const formatText = (
		format: "bold" | "italic" | "underline" | "strikethrough" | "code",
	) => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
	};

	const insertHeading = (tag: HeadingTagType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createHeadingNode(tag));
			}
		});
	};

	const insertQuote = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createQuoteNode());
			}
		});
	};

	const applyTextColor = (color: string) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				// Apply color using selection's style property
				selection.setStyle(`color: ${color}`);
			}
		});
		setCurrentTextColor(color);
		setShowColorPicker(false);
	};

	const toolbarButtons: ToolbarButton[] = [
		{
			id: "bold",
			label: "Bold",
			icon: Bold,
			command: () => formatText("bold"),
			isActive: isBold,
		},
		{
			id: "italic",
			label: "Italic",
			icon: Italic,
			command: () => formatText("italic"),
			isActive: isItalic,
		},
		{
			id: "underline",
			label: "Underline",
			icon: Underline,
			command: () => formatText("underline"),
			isActive: isUnderline,
		},
		{
			id: "strikethrough",
			label: "Strikethrough",
			icon: Strikethrough,
			command: () => formatText("strikethrough"),
			isActive: isStrikethrough,
		},
	];

	const middleToolbarButtons: ToolbarButton[] = [
		{
			id: "heading1",
			label: "Heading 1",
			icon: Heading1,
			command: () => insertHeading("h1"),
			isActive: isHeading1,
		},
		{
			id: "heading2",
			label: "Heading 2",
			icon: Heading2,
			command: () => insertHeading("h2"),
			isActive: isHeading2,
		},
		{
			id: "heading3",
			label: "Heading 3",
			icon: Heading3,
			command: () => insertHeading("h3"),
			isActive: isHeading3,
		},
		{
			id: "quote",
			label: "Quote",
			icon: Quote,
			command: () => insertQuote(),
			isActive: isQuote,
		},
		{
			id: "code",
			label: "Code",
			icon: Code,
			command: () => formatText("code"),
			isActive: isCode,
		},
	];

	const endToolbarButtons: ToolbarButton[] = [
		{
			id: "textColor",
			label: "Text Color",
			icon: Brush,
			command: () => {
				setShowColorPicker(!showColorPicker);
			},
			isActive: showColorPicker,
		},
		{
			id: "backgroundColor",
			label: "Background Color",
			icon: Palette,
			command: () => {
				console.log("Background color picker");
			},
			isActive: false,
		},
		{
			id: "divider",
			label: "Divider",
			icon: Divide,
			command: () => {
				console.log("Add divider");
			},
			isActive: false,
		},
		{
			id: "link",
			label: "Link",
			icon: Link,
			command: () => {
				console.log("Add link");
			},
			isActive: false,
			disabled: false,
		},
	];

	if (!isVisible) {
		return null;
	}

	return (
		<div
			ref={toolbarRef}
			className="fixed z-50 bg-black-200 border border-accent/80 rounded-lg shadow-lg p-2 flex items-center gap-1"
			style={{
				top: position.top,
				left: position.left,
				transform: "translateX(-50%)",
			}}
		>
			<div className="flex items-center gap-1">
				{toolbarButtons.map((button) => (
					<IconButton
						key={button.id}
						size="sm"
						className="p-2"
						icon={button.icon}
						iconProps={{ size: 16 }}
						onClick={button.command}
						disabled={button.disabled}
						variant={button.isActive ? "primary" : "icon"}
					/>
				))}
			</div>

			<div className="h-6 flex items-center">
				<Separator
					orientation="vertical"
					className="border border-gray-200/50 w-[1px] rounded-lg mx-2"
				/>
			</div>

			<div className="flex items-center gap-1">
				{middleToolbarButtons.map((button) => (
					<IconButton
						key={button.id}
						size="sm"
						className="p-2"
						icon={button.icon}
						iconProps={{ size: 16 }}
						onClick={button.command}
						disabled={button.disabled}
						variant={button.isActive ? "primary" : "icon"}
					/>
				))}
			</div>

			<div className="h-6 flex items-center">
				<Separator
					orientation="vertical"
					className="border border-gray-200/50 w-[1px] rounded-lg mx-2"
				/>
			</div>

			<div className="flex items-center gap-1">
				{endToolbarButtons.map((button) => (
					<IconButton
						key={button.id}
						size="sm"
						className="p-2"
						icon={button.icon}
						iconProps={{ size: 16 }}
						onClick={button.command}
						disabled={button.disabled}
						variant={button.isActive ? "primary" : "icon"}
					/>
				))}
			</div>

			{showColorPicker && (
				<div
					className="absolute top-full flex flex-col gap-2 right-0 mt-2 bg-black-200 border border-accent/80 rounded-lg shadow-lg p-3 z-50"
					style={{ minWidth: "200px" }}
				>
					<div className="mb-2">
						<label className="text-sm font-medium text-accent mb-1 block">
							Text Color
						</label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={currentTextColor}
								onChange={(e) => setCurrentTextColor(e.target.value)}
								className="w-8 h-8 border border-accent/80 rounded cursor-pointer"
							/>
							<input
								type="text"
								value={currentTextColor}
								onChange={(e) => setCurrentTextColor(e.target.value)}
								className="flex-1 px-2 py-1 border border-accent/80 rounded text-sm"
								placeholder="#000000"
							/>
						</div>
					</div>

					<div className="mb-3">
						<div className="grid grid-cols-8 gap-1">
							{[
								"#000000",
								"#333333",
								"#666666",
								"#999999",
								"#FF0000",
								"#00FF00",
								"#0000FF",
								"#FFFF00",
								"#FF00FF",
								"#00FFFF",
								"#FFA500",
								"#800080",
								"#FFC0CB",
								"#A52A2A",
								"#808080",
								"#FFFFFF",
							].map((color) => (
								<button
									key={color}
									className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
									style={{ backgroundColor: color }}
									onClick={() => applyTextColor(color)}
									title={color}
								/>
							))}
						</div>
					</div>

					<div className="flex items-center justify-end gap-2">
						<Button
							size="sm"
							variant="secondary"
							className="p-2 text-sm"
							onClick={() => setShowColorPicker(false)}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							className="p-2 text-sm"
							onClick={() => applyTextColor(currentTextColor)}
						>
							Apply
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
