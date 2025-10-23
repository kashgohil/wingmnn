import { useState } from "react";
import { SimpleRichTextEditor } from "../components/SimpleRichTextEditor";

export function SimpleEditorDemo() {
	const [value, setValue] = useState(`
		<h1>Welcome to Simple Rich Text Editor</h1>
		<p>This is a <strong>simple rich text editor</strong> that feels more like a traditional text editor rather than a block-based editor like Notion.</p>
		<p>You can:</p>
		<ul>
			<li>Select text to see the <em>floating toolbar</em></li>
			<li>Use keyboard shortcuts like <kbd>Ctrl+B</kbd> for bold</li>
			<li>Format text with <u>underline</u> and <s>strikethrough</s></li>
			<li>Add <a href="https://example.com">links</a> and <code>code snippets</code></li>
		</ul>
		<blockquote>
			<p>This editor uses contentEditable for a more natural writing experience.</p>
		</blockquote>
	`);

	const handleChange = (newValue: string) => {
		setValue(newValue);
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">
					Simple Rich Text Editor Demo
				</h2>
				<p className="text-gray-600">
					This editor feels more like a traditional rich text editor (like
					Google Docs or Word) rather than a block-based editor like Notion.
				</p>
			</div>

			<div className="mb-4">
				<h3 className="text-lg font-semibold mb-2">Features:</h3>
				<ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
					<li>Select text to see the floating toolbar</li>
					<li>
						Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U
						(underline), Ctrl+K (link)
					</li>
					<li>Rich text formatting: bold, italic, underline, strikethrough</li>
					<li>Text and background colors</li>
					<li>Link insertion</li>
					<li>Code formatting</li>
					<li>Auto-save functionality (optional)</li>
				</ul>
			</div>

			<div className="border rounded-lg overflow-hidden">
				<SimpleRichTextEditor
					value={value}
					onChange={handleChange}
					placeholder="Start writing your content here..."
					enableAutoSave={true}
					enableKeyboardShortcuts={true}
					className="w-full"
				/>
			</div>

			<div className="mt-4 p-4 bg-gray-50 rounded-lg">
				<h4 className="font-semibold mb-2">HTML Output:</h4>
				<pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
					{value}
				</pre>
			</div>
		</div>
	);
}
