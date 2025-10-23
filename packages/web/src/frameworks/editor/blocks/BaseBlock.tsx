import React, { useLayoutEffect, useRef, useState } from "react";
import { RichTextFormatter } from "../core/RichTextFormatter";
import type { BlockProps } from "../types";

interface BaseBlockComponentProps extends BlockProps {
	className?: string;
	placeholder?: string;
	onKeyDown?: (event: React.KeyboardEvent) => void;
	onInput?: (event: React.FormEvent) => void;
	onPaste?: (event: React.ClipboardEvent) => void;
}

export function BaseBlock({
	block,
	isSelected,
	isFocused,
	onUpdate,
	onDelete,
	onFocus,
	onBlur,
	className = "",
	placeholder = "Type something...",
	onKeyDown,
	onInput,
	onPaste,
}: BaseBlockComponentProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isEditing, setIsEditing] = useState(false);

	useLayoutEffect(() => {
		if (contentRef.current && isFocused) {
			contentRef.current.focus();
		}
	}, [isFocused]);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (onKeyDown) {
			onKeyDown(event);
		}

		// Handle Enter key
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			// This will be handled by the parent editor
		}

		// Handle Backspace
		if (event.key === "Backspace" && block.content === "") {
			event.preventDefault();
			onDelete();
		}

		// Handle Tab for indentation
		if (event.key === "Tab") {
			event.preventDefault();
			// Handle indentation logic here
		}
	};

	const handleInput = (event: React.FormEvent) => {
		const target = event.target as HTMLDivElement;
		const newContent = target.textContent || "";

		if (newContent !== block.content) {
			handleContentChange(newContent);
		}

		if (onInput) {
			onInput(event);
		}
	};

	// Render formatted content
	const renderFormattedContent = () => {
		if (block.metadata?.formats && block.metadata.formats.length > 0) {
			const richBlock = { ...block, formats: block.metadata.formats };
			return (
				<div
					dangerouslySetInnerHTML={{
						__html: RichTextFormatter.renderToHTML(richBlock),
					}}
				/>
			);
		}
		return block.content || (isFocused ? "" : placeholder);
	};

	// Handle content changes with formatting preservation
	const handleContentChange = (newContent: string) => {
		// If we have formats, we need to preserve them
		if (block.metadata?.formats && block.metadata.formats.length > 0) {
			// For now, we'll clear formats when content changes
			// In a full implementation, we'd need to adjust format positions
			onUpdate({
				content: newContent,
				metadata: {
					...block.metadata,
					formats: [],
				},
			});
		} else {
			onUpdate({ content: newContent });
		}
	};

	const handlePaste = (event: React.ClipboardEvent) => {
		event.preventDefault();

		const text = event.clipboardData.getData("text/plain");
		const selection = window.getSelection();

		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();
			range.insertNode(document.createTextNode(text));

			// Update content
			const newContent = contentRef.current?.textContent || "";
			onUpdate({ content: newContent });
		}

		if (onPaste) {
			onPaste(event);
		}
	};

	const handleFocus = () => {
		setIsEditing(true);
		onFocus();
	};

	const handleBlur = () => {
		setIsEditing(false);
		onBlur();
	};

	const getBlockClassName = () => {
		const baseClasses = "block min-h-[1.5rem] outline-none focus:outline-none";
		const selectedClasses = isSelected ? "bg-accent/50" : "";
		const editingClasses = isEditing ? "ring-1 ring-accent/80" : "";

		return `${baseClasses} ${selectedClasses} ${editingClasses} ${className}`.trim();
	};

	return (
		<div
			ref={contentRef}
			contentEditable
			suppressContentEditableWarning
			className={getBlockClassName()}
			onKeyDown={handleKeyDown}
			onInput={handleInput}
			onPaste={handlePaste}
			onFocus={handleFocus}
			onBlur={handleBlur}
			data-block-id={block.id}
			data-block-type={block.type}
		>
			{renderFormattedContent()}
		</div>
	);
}
