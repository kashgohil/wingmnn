import { IconButton, Separator } from "@wingmnn/components";
import {
	Bold,
	Brush,
	Code,
	Italic,
	Link,
	Palette,
	Strikethrough,
	Underline,
	type LucideIcon,
} from "@wingmnn/components/icons";
import { useEffect, useRef, useState } from "react";
import { ColorPicker } from "../components/ColorPicker";
import { LinkDialog } from "../components/LinkDialog";

interface SimpleSelection {
	range: Range;
	rect: DOMRect;
	text: string;
}

interface SimpleFloatingToolbarProps {
	selection: SimpleSelection | null;
	onFormat: (command: string, value?: string) => void;
	onInsertLink: (url: string, text?: string) => void;
}

interface ToolbarButton {
	id: string;
	label: string;
	icon: LucideIcon;
	command: string;
	value?: string;
	isActive?: boolean;
	disabled?: boolean;
}

export function SimpleFloatingToolbar({
	selection,
	onFormat,
	onInsertLink,
}: SimpleFloatingToolbarProps) {
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const [colorPickerType, setColorPickerType] = useState<"text" | "background">(
		"text",
	);
	const toolbarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!selection || !selection.text.trim()) {
			setIsVisible(false);
			return;
		}

		// Calculate position based on selection
		const rect = selection.rect;
		const toolbarHeight = 40; // Approximate toolbar height
		const toolbarWidth = 300; // Approximate toolbar width

		// Position above the selection, centered
		let top = rect.top - toolbarHeight - 8;
		let left = rect.left + rect.width / 2;

		// Adjust if toolbar would go off screen
		const viewportWidth = window.innerWidth;

		// Horizontal adjustment
		if (left - toolbarWidth / 2 < 8) {
			left = 8 + toolbarWidth / 2;
		} else if (left + toolbarWidth / 2 > viewportWidth - 8) {
			left = viewportWidth - 8 - toolbarWidth / 2;
		}

		// Vertical adjustment - if not enough space above, show below
		if (top < 8) {
			top = rect.bottom + 8;
		}

		setPosition({ top, left });
		setIsVisible(true);
	}, [selection]);

	// Check if a format is currently active
	const isFormatActive = (command: string): boolean => {
		if (!selection) return false;

		try {
			return document.queryCommandState(command);
		} catch {
			return false;
		}
	};

	const formatButtons: ToolbarButton[] = [
		{
			id: "bold",
			label: "Bold",
			icon: Bold,
			command: "bold",
			isActive: isFormatActive("bold"),
		},
		{
			id: "italic",
			label: "Italic",
			icon: Italic,
			command: "italic",
			isActive: isFormatActive("italic"),
		},
		{
			id: "underline",
			label: "Underline",
			icon: Underline,
			command: "underline",
			isActive: isFormatActive("underline"),
		},
		{
			id: "strikethrough",
			label: "Strikethrough",
			icon: Strikethrough,
			command: "strikeThrough",
			isActive: isFormatActive("strikeThrough"),
		},
		{
			id: "code",
			label: "Code",
			icon: Code,
			command: "insertHTML",
			value: "<code>$1</code>",
		},
	];

	const handleFormat = (button: ToolbarButton) => {
		if (button.command === "insertHTML" && button.value) {
			// For code formatting, we need to wrap the selected text
			const selectedText = selection?.text || "";
			const wrappedText = button.value.replace("$1", selectedText);
			onFormat(button.command, wrappedText);
		} else {
			onFormat(button.command);
		}
	};

	const handleTextColor = (color: string) => {
		onFormat("foreColor", color);
		setIsColorPickerOpen(false);
	};

	const handleBackgroundColor = (color: string) => {
		onFormat("backColor", color);
		setIsColorPickerOpen(false);
	};

	const handleLinkInsert = (url: string, text?: string) => {
		onInsertLink(url, text);
		setIsLinkDialogOpen(false);
	};

	if (!isVisible || !selection) {
		return null;
	}

	return (
		<>
			<div
				ref={toolbarRef}
				className="fixed z-50 bg-black-100 border border-accent rounded-lg shadow-lg p-2 flex items-center gap-1"
				style={{
					top: position.top,
					left: position.left,
					transform: "translateX(-50%)",
				}}
			>
				{/* Format buttons */}
				<div className="flex items-center gap-1">
					{formatButtons.map((button) => (
						<IconButton
							size="sm"
							className="p-2"
							key={button.id}
							icon={button.icon}
							title={button.label}
							iconProps={{ size: 16 }}
							disabled={button.disabled}
							onClick={() => handleFormat(button)}
							variant={button.isActive ? "primary" : "icon"}
						/>
					))}
				</div>

				{/* Separator */}
				<div className="h-6 flex items-center">
					<Separator
						orientation="vertical"
						className="border border-accent/50 w-[1px] rounded-lg mx-2"
					/>
				</div>

				{/* Text color button */}
				<IconButton
					size="sm"
					icon={Brush}
					className="p-2"
					iconProps={{ size: 16 }}
					onClick={() => {
						setColorPickerType("text");
						setIsColorPickerOpen(true);
					}}
				/>

				{/* Background color button */}
				<IconButton
					size="sm"
					icon={Palette}
					className="p-2"
					iconProps={{ size: 16 }}
					onClick={() => {
						setColorPickerType("background");
						setIsColorPickerOpen(true);
					}}
				/>

				{/* Link button */}
				<IconButton
					size="sm"
					icon={Link}
					className="p-2"
					iconProps={{ size: 16 }}
					onClick={() => setIsLinkDialogOpen(true)}
				/>
			</div>

			{/* Color Picker */}
			{isColorPickerOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsColorPickerOpen(false)}
				>
					<div
						className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2"
						style={{
							top: position.top + 40,
							left: position.left,
							transform: "translateX(-50%)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<ColorPicker
							onColorSelect={
								colorPickerType === "text"
									? handleTextColor
									: handleBackgroundColor
							}
							label={
								colorPickerType === "text" ? "Text Color" : "Background Color"
							}
							defaultColor={colorPickerType === "text" ? "#000000" : "#ffffff"}
						/>
					</div>
				</div>
			)}

			{/* Link Dialog */}
			<LinkDialog
				isOpen={isLinkDialogOpen}
				onConfirm={handleLinkInsert}
				onClose={() => setIsLinkDialogOpen(false)}
			/>
		</>
	);
}
