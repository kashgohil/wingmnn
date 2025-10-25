import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";

interface SelectionState {
	isCollapsed: boolean;
	hasSelection: boolean;
	selectedText: string;
}

export function LexicalSelectionPlugin() {
	const [editor] = useLexicalComposerContext();
	const [selectionState, setSelectionState] = useState<SelectionState>({
		isCollapsed: true,
		hasSelection: false,
		selectedText: "",
	});

	useEffect(() => {
		const updateSelection = () => {
			editor.getEditorState().read(() => {
				const selection = $getSelection();

				if ($isRangeSelection(selection)) {
					const isCollapsed = selection.isCollapsed();
					const selectedText = selection.getTextContent();

					setSelectionState({
						isCollapsed,
						hasSelection: !isCollapsed && selectedText.length > 0,
						selectedText,
					});
				} else {
					setSelectionState({
						isCollapsed: true,
						hasSelection: false,
						selectedText: "",
					});
				}
			});
		};

		const removeUpdateListener = editor.registerUpdateListener(
			({ editorState }) => {
				editorState.read(() => {
					updateSelection();
				});
			},
		);

		return removeUpdateListener;
	}, [editor]);

	// Store selection state in editor for use by other plugins
	useEffect(() => {
		(editor as any).__selectionState = selectionState;
	}, [editor, selectionState]);

	return null;
}
