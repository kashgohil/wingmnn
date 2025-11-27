import { cn } from "@/lib/utils";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState } from "lexical";
import { $createParagraphNode, $getRoot } from "lexical";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { ToolbarPlugin } from "./ToolbarPlugin";

const theme = {
	paragraph: "mb-2 leading-relaxed",
	quote: "border-l-2 pl-3 italic text-muted-foreground",
	heading: {
		h1: "text-2xl font-semibold",
		h2: "text-xl font-semibold",
		h3: "text-lg font-semibold",
	},
	text: {
		bold: "font-semibold",
		italic: "italic",
		underline: "underline",
		strikethrough: "line-through",
	},
	list: {
		listitem: "mb-1",
		olDepth: ["ml-5 list-decimal"],
		ulDepth: ["ml-5 list-disc"],
	},
};

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	id?: string;
	containerClassName?: string;
	contentClassName?: string;
	placeholderClassName?: string;
	toolbarClassName?: string;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Add details...",
	id,
	containerClassName,
	contentClassName,
	placeholderClassName,
	toolbarClassName,
}: RichTextEditorProps) {
	const lastSyncedValueRef = useRef(value);
	const initialConfig = useMemo(
		() => ({
			namespace: "task-description-editor",
			editable: true,
			theme,
			onError(error: Error) {
				// Surface Lexical errors during development
				// eslint-disable-next-line no-console
				console.error(error);
				throw error;
			},
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
		}),
		[],
	);

	return (
		<div
			className={cn(
				"group/editor relative overflow-hidden rounded-none border-2 border-border bg-card text-foreground transition-[border-color,box-shadow]",
				containerClassName,
				"retro-border-shadow-sm",
				"focus-within:border-primary focus-within:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.18),inset_2px_2px_0_rgba(255,255,255,0.92)]",
			)}
		>
			<LexicalComposer initialConfig={initialConfig}>
				<ToolbarPlugin toolbarClassName={toolbarClassName} />
				<div className="relative">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								id={id}
								className={cn(
									"min-h-[295px] w-full bg-transparent! px-3 py-2 text-base text-foreground",
									contentClassName,
									"selection:bg-primary selection:text-muted-foreground  focus:outline-none bg-transparent",
								)}
							/>
						}
						placeholder={
							<div
								className={cn(
									"pointer-events-none absolute left-3.5 top-3 text-sm text-muted-foreground/70",
									placeholderClassName,
								)}
							>
								{placeholder}
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HtmlInitialValuePlugin
						value={value}
						syncRef={lastSyncedValueRef}
					/>
					<HtmlOnChangePlugin
						onHtmlChange={onChange}
						syncRef={lastSyncedValueRef}
					/>
				</div>
				<HistoryPlugin />
				<ListPlugin />
				<LinkPlugin />
			</LexicalComposer>
		</div>
	);
}

function HtmlOnChangePlugin({
	onHtmlChange,
	syncRef,
}: {
	onHtmlChange: (html: string) => void;
	syncRef: RefObject<string>;
}) {
	return (
		<OnChangePlugin
			onChange={(editorState: EditorState, editor) => {
				editorState.read(() => {
					const html = $generateHtmlFromNodes(editor, null);
					syncRef.current = html;
					onHtmlChange(html);
				});
			}}
		/>
	);
}

function HtmlInitialValuePlugin({
	value,
	syncRef,
}: {
	value: string;
	syncRef: RefObject<string>;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (typeof window === "undefined" || value === syncRef.current) {
			return;
		}

		syncRef.current = value;
		editor.update(() => {
			const root = $getRoot();
			root.clear();

			if (!value.trim()) {
				root.append($createParagraphNode());
				root.selectStart();
				return;
			}

			const parser = new DOMParser();
			const dom = parser.parseFromString(value, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);
			nodes.forEach((node) => {
				root.append(node);
			});

			root.selectEnd();
		});
	}, [editor, syncRef, value]);

	return null;
}
