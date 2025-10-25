import { type EditorThemeClasses } from "lexical";

export const LexicalTheme: EditorThemeClasses = {
	// Text formatting
	text: {
		bold: "font-bold",
		italic: "italic",
		underline: "underline",
		strikethrough: "line-through",
		code: "bg-accent/40 px-1 py-0.5 rounded text-sm font-mono",
	},

	// Headings
	heading: {
		h1: "text-3xl font-bold mb-4",
		h2: "text-2xl font-bold mb-3",
		h3: "text-xl font-bold mb-2",
		h4: "text-lg font-bold mb-2",
		h5: "text-base font-bold mb-1",
		h6: "text-sm font-bold mb-1",
	},

	// Lists
	list: {
		nested: {
			listitem: "ml-4",
		},
		ol: "list-decimal list-inside mb-2",
		ul: "list-disc list-inside mb-2",
		listitem: "mb-1",
	},

	// Links
	link: "text-accent underline hover:text-accent/80 cursor-pointer",

	// Code blocks
	code: "bg-accent/40 p-4 rounded-lg font-mono text-sm block mb-4",

	// Quotes
	quote: "border-l-4 border-accent/80 pl-4 italic text-accent mb-4",

	// Paragraphs
	paragraph: "mb-2",

	// Root
	root: "prose max-w-none",
};
