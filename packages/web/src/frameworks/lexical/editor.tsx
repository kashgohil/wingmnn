import { CodeExtension } from "@lexical/code";
import {
	ClearEditorExtension,
	HorizontalRuleExtension,
	NodeSelectionExtension,
	TabIndentationExtension,
} from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { LinkExtension } from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ReactExtension } from "@lexical/react/ReactExtension";
import { RichTextExtension } from "@lexical/rich-text";
import { cx } from "@wingmnn/components";
import { configExtension, defineExtension } from "lexical";
import { LexicalFloatingToolbar } from "./FloatingToolbar";
import { LexicalTheme } from "./theme";

interface EditorProps {
	name: string;
	placeholder?: string;
	className?: string;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
	console.error(error);
}

export function Editor({
	name,
	placeholder = "Enter some text...",
	className = "",
}: EditorProps) {
	const editorExtension = defineExtension({
		name: "[root]",
		namespace: name,
		dependencies: [
			LinkExtension,
			ListExtension,
			CodeExtension,
			HistoryExtension,
			RichTextExtension,
			CheckListExtension,
			ClearEditorExtension,
			NodeSelectionExtension,
			HorizontalRuleExtension,
			TabIndentationExtension,
			configExtension(ReactExtension, { contentEditable: null }),
		],
		// The editor theme
		theme: LexicalTheme,
		onError,
	});

	return (
		<div className={cx("relative", className)}>
			<LexicalExtensionComposer extension={editorExtension}>
				<div className="relative">
					<ContentEditable
						aria-placeholder={placeholder}
						className="min-h-[200px] p-2 rounded-lg outline-none caret-accent"
						placeholder={
							<div className="text-accent/40 absolute top-2 left-2 pointer-events-none">
								{placeholder}
							</div>
						}
					/>
					<MarkdownShortcutPlugin />
					<LexicalFloatingToolbar />
				</div>
			</LexicalExtensionComposer>
		</div>
	);
}
