import { Button } from "@wingmnn/components";
import { useEffect, useRef, useState } from "react";
import { ColorPicker } from "../components/ColorPicker";
import { LinkDialog } from "../components/LinkDialog";
import type { FloatingToolbarProps } from "../types";

interface ToolbarButton {
	id: string;
	label: string;
	icon?: string;
	action: () => void;
	isActive?: boolean;
	disabled?: boolean;
}

export function FloatingToolbar({
	selection,
	onFormat,
	onInsertBlock,
}: FloatingToolbarProps) {
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!selection || selection.isCollapsed) {
			setIsVisible(false);
			return;
		}

		// Calculate position based on selection
		const range = window.getSelection()?.getRangeAt(0);
		if (range) {
			const rect = range.getBoundingClientRect();
			const toolbarHeight = 40; // Approximate toolbar height

			setPosition({
				top: rect.top - toolbarHeight - 8,
				left: rect.left + rect.width / 2,
			});
			setIsVisible(true);
		}
	}, [selection]);

	const formatButtons: ToolbarButton[] = [
		{
			id: "bold",
			label: "Bold",
			icon: "B",
			action: () => onFormat("bold"),
			isActive: false, // This would be determined by current formatting
		},
		{
			id: "italic",
			label: "Italic",
			icon: "I",
			action: () => onFormat("italic"),
			isActive: false,
		},
		{
			id: "underline",
			label: "Underline",
			icon: "U",
			action: () => onFormat("underline"),
			isActive: false,
		},
		{
			id: "strikethrough",
			label: "Strikethrough",
			icon: "S",
			action: () => onFormat("strikethrough"),
			isActive: false,
		},
		{
			id: "textColor",
			label: "Text Color",
			icon: "A",
			action: () => {
				// This will be handled by the ColorPicker component
			},
			isActive: false,
		},
		{
			id: "backgroundColor",
			label: "Background Color",
			icon: "🎨",
			action: () => {
				// This will be handled by the ColorPicker component
			},
			isActive: false,
		},
	];

	const blockButtons: ToolbarButton[] = [
		{
			id: "heading1",
			label: "Heading 1",
			action: () => onInsertBlock("heading1"),
		},
		{
			id: "heading2",
			label: "Heading 2",
			action: () => onInsertBlock("heading2"),
		},
		{
			id: "checklist",
			label: "Checklist",
			action: () => onInsertBlock("checklist"),
		},
		{
			id: "code",
			label: "Code",
			action: () => onInsertBlock("codeBlock"),
		},
		{
			id: "quote",
			label: "Quote",
			action: () => onInsertBlock("quote"),
		},
	];

	if (!isVisible || !selection) {
		return null;
	}

	return (
		<>
			<div
				ref={toolbarRef}
				className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
				style={{
					top: position.top,
					left: position.left,
					transform: "translateX(-50%)",
				}}
			>
				{/* Format buttons */}
				<div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
					{formatButtons.map((button) => {
						if (button.id === "textColor") {
							return (
								<ColorPicker
									key={button.id}
									onColorSelect={(color) => onFormat("textColor", color)}
									label="Text Color"
									defaultColor="#000000"
								/>
							);
						}

						if (button.id === "backgroundColor") {
							return (
								<ColorPicker
									key={button.id}
									onColorSelect={(color) => onFormat("backgroundColor", color)}
									label="Background"
									defaultColor="#ffffff"
								/>
							);
						}

						return (
							<button
								key={button.id}
								onClick={button.action}
								disabled={button.disabled}
								className={`
                px-2 py-1 text-sm font-medium rounded hover:bg-gray-100
                ${
									button.isActive
										? "bg-blue-100 text-blue-700"
										: "text-gray-700"
								}
                ${
									button.disabled
										? "opacity-50 cursor-not-allowed"
										: "cursor-pointer"
								}
              `}
								title={button.label}
							>
								{button.icon || button.label}
							</button>
						);
					})}
				</div>

				{/* Block type buttons */}
				<div className="flex items-center gap-1">
					{blockButtons.map((button) => (
						<Button
							key={button.id}
							onClick={button.action}
							className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
							title={button.label}
						>
							{button.label}
						</Button>
					))}
				</div>

				{/* Link button */}
				<button
					onClick={() => setIsLinkDialogOpen(true)}
					className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
					title="Add Link"
				>
					🔗
				</button>
			</div>

			<LinkDialog
				isOpen={isLinkDialogOpen}
				onClose={() => setIsLinkDialogOpen(false)}
				onConfirm={(url) => {
					onFormat("link", url);
					setIsLinkDialogOpen(false);
				}}
			/>
		</>
	);
}
