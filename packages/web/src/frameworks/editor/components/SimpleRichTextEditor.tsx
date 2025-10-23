import { cx } from "@wingmnn/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { SimpleFloatingToolbar } from "../toolbar/SimpleFloatingToolbar";

export interface SimpleRichTextEditorProps {
	value: string;
	onChange(value: string): void;
	placeholder?: string;
	className?: string;
	enableAutoSave?: boolean;
	enableKeyboardShortcuts?: boolean;
}

export function SimpleRichTextEditor({
	value,
	onChange,
	placeholder = "Start writing...",
	className = "",
	enableAutoSave = false,
	enableKeyboardShortcuts = true,
}: SimpleRichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const isUpdatingRef = useRef(false);
	const [selection, setSelection] = useState<{
		range: Range;
		rect: DOMRect;
		text: string;
	} | null>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [isComposing, setIsComposing] = useState(false);

	// Set initial content when component mounts
	useEffect(() => {
		if (editorRef.current && value) {
			editorRef.current.innerHTML = value;
		}
	}, []);

	// Update editor content when value prop changes (only if not focused to avoid cursor issues)
	useEffect(() => {
		if (
			editorRef.current &&
			!isFocused &&
			editorRef.current.innerHTML !== value
		) {
			isUpdatingRef.current = true;
			editorRef.current.innerHTML = value;
			isUpdatingRef.current = false;
		}
	}, [value, isFocused]);

	// Handle content changes
	const handleInput = useCallback(() => {
		if (editorRef.current && !isComposing && !isUpdatingRef.current) {
			const newValue = editorRef.current.innerHTML;
			onChange(newValue);
		}
	}, [onChange, isComposing]);

	// Handle selection changes
	const handleSelectionChange = useCallback(() => {
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0) {
			const range = sel.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			// Only show toolbar if there's a text selection
			if (!sel.isCollapsed && rect.width > 0 && rect.height > 0) {
				setSelection({
					range,
					rect,
					text: sel.toString(),
				});
			} else {
				setSelection(null);
			}
		} else {
			setSelection(null);
		}
	}, []);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enableKeyboardShortcuts || !isFocused) return;

			const isCtrlOrCmd = event.ctrlKey || event.metaKey;

			if (isCtrlOrCmd) {
				switch (event.key.toLowerCase()) {
					case "b":
						event.preventDefault();
						document.execCommand("bold");
						break;
					case "i":
						event.preventDefault();
						document.execCommand("italic");
						break;
					case "u":
						event.preventDefault();
						document.execCommand("underline");
						break;
					case "k":
						event.preventDefault();
						// Handle link insertion
						break;
				}
			}
		},
		[enableKeyboardShortcuts, isFocused],
	);

	// Handle focus
	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	// Handle blur
	const handleBlur = useCallback(() => {
		setIsFocused(false);
		// Delay hiding selection to allow toolbar clicks
		setTimeout(() => {
			if (!editorRef.current?.contains(document.activeElement)) {
				setSelection(null);
			}
		}, 100);
	}, []);

	// Handle composition start (for IME input)
	const handleCompositionStart = useCallback(() => {
		setIsComposing(true);
	}, []);

	// Handle composition end
	const handleCompositionEnd = useCallback(() => {
		setIsComposing(false);
		handleInput();
	}, [handleInput]);

	// Format text using document.execCommand
	const formatText = useCallback(
		(command: string, value?: string) => {
			if (editorRef.current) {
				editorRef.current.focus();

				if (value) {
					document.execCommand(command, false, value);
				} else {
					document.execCommand(command, false);
				}

				// Trigger input event to update parent
				handleInput();
			}
		},
		[handleInput],
	);

	// Insert link
	const insertLink = useCallback(
		(url: string, text?: string) => {
			if (editorRef.current) {
				editorRef.current.focus();

				if (text) {
					document.execCommand(
						"insertHTML",
						false,
						`<a href="${url}">${text}</a>`,
					);
				} else {
					document.execCommand("createLink", false, url);
				}

				handleInput();
			}
		},
		[handleInput],
	);

	// Set up event listeners
	useEffect(() => {
		const editor = editorRef.current;
		if (!editor) return;

		// Add event listeners
		editor.addEventListener("input", handleInput);
		editor.addEventListener("focus", handleFocus);
		editor.addEventListener("blur", handleBlur);
		editor.addEventListener("compositionstart", handleCompositionStart);
		editor.addEventListener("compositionend", handleCompositionEnd);

		// Global selection change listener
		document.addEventListener("selectionchange", handleSelectionChange);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			editor.removeEventListener("input", handleInput);
			editor.removeEventListener("focus", handleFocus);
			editor.removeEventListener("blur", handleBlur);
			editor.removeEventListener("compositionstart", handleCompositionStart);
			editor.removeEventListener("compositionend", handleCompositionEnd);
			document.removeEventListener("selectionchange", handleSelectionChange);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		handleInput,
		handleFocus,
		handleBlur,
		handleCompositionStart,
		handleCompositionEnd,
		handleSelectionChange,
		handleKeyDown,
	]);

	// Auto-save functionality
	useEffect(() => {
		if (!enableAutoSave) return;

		const interval = setInterval(() => {
			if (editorRef.current) {
				const content = editorRef.current.innerHTML;
				localStorage.setItem("simple-editor-autosave", content);
			}
		}, 5000);

		// Load auto-saved content on mount
		const savedContent = localStorage.getItem("simple-editor-autosave");
		if (savedContent && !value) {
			onChange(savedContent);
		}

		return () => {
			clearInterval(interval);
		};
	}, [enableAutoSave, value, onChange]);

	console.log({ value, isAvailable: !value });

	return (
		<div className={cx("relative simple-rich-text-editor", className)}>
			<div
				ref={editorRef}
				contentEditable
				style={{ lineHeight: "1.6" }}
				data-placeholder={placeholder}
				className="min-h-[200px] rounded-lg p-2 focus-within:outline-2 outline-accent/80 focus-within:outline-offset-2 transition-all duration-200 break-words"
			/>

			{/* Placeholder */}
			{!value && (
				<div className="absolute top-2 left-2 text-accent/40 pointer-events-none">
					{placeholder}
				</div>
			)}

			{/* Floating Toolbar */}
			<SimpleFloatingToolbar
				selection={selection}
				onFormat={formatText}
				onInsertLink={insertLink}
			/>
		</div>
	);
}
