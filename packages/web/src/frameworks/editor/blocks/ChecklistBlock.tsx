import { useEffect, useState } from "react";
import type { BlockProps } from "../types";

export function ChecklistBlock({
	block,
	isSelected,
	isFocused,
	onUpdate,
	onDelete,
	onFocus,
	onBlur,
}: BlockProps) {
	const [isChecked, setIsChecked] = useState(block.metadata?.checked || false);

	// Update local state when block metadata changes
	useEffect(() => {
		setIsChecked(block.metadata?.checked || false);
	}, [block.metadata?.checked]);

	const handleCheckboxChange = (checked: boolean) => {
		setIsChecked(checked);
		onUpdate({
			metadata: {
				...block.metadata,
				checked,
			},
		});
	};

	const handleContentChange = (content: string) => {
		onUpdate({ content });
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		// Handle Enter key to create new checklist item
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			// This will be handled by the parent editor
		}

		// Handle Space key to toggle checkbox
		if (event.key === " " && event.target === event.currentTarget) {
			event.preventDefault();
			handleCheckboxChange(!isChecked);
		}

		// Handle Backspace when content is empty
		if (event.key === "Backspace" && block.content === "") {
			event.preventDefault();
			onDelete();
		}
	};

	const handleInput = (event: React.FormEvent) => {
		const target = event.target as HTMLDivElement;
		const newContent = target.textContent || "";

		if (newContent !== block.content) {
			handleContentChange(newContent);
		}
	};

	const handleFocus = () => {
		onFocus();
	};

	const handleBlur = () => {
		onBlur();
	};

	const getContentClassName = () => {
		const baseClasses =
			"flex-1 min-h-[1.5rem] outline-none focus:outline-none text-base leading-relaxed";
		const checkedClasses = isChecked ? "line-through text-gray-500" : "";
		const selectedClasses = isSelected ? "bg-blue-50" : "";

		return `${baseClasses} ${checkedClasses} ${selectedClasses}`.trim();
	};

	return (
		<div className="flex items-start gap-3 group">
			{/* Checkbox */}
			<div className="flex-shrink-0 mt-1">
				<input
					type="checkbox"
					checked={isChecked}
					onChange={(e) => handleCheckboxChange(e.target.checked)}
					className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
			</div>

			{/* Content */}
			<div
				contentEditable
				suppressContentEditableWarning
				className={getContentClassName()}
				onKeyDown={handleKeyDown}
				onInput={handleInput}
				onFocus={handleFocus}
				onBlur={handleBlur}
				data-block-id={block.id}
				data-block-type={block.type}
			>
				{block.content || (isFocused ? "" : "Add a task...")}
			</div>

			{/* Delete button (appears on hover) */}
			<button
				onClick={onDelete}
				className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
				title="Delete task"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	);
}
