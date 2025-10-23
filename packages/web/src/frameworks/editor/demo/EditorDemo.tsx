import { useState } from "react";
import { OptimizedEditor } from "../components/OptimizedEditor";

export function EditorDemo() {
	const [value, setValue] = useState("");

	return (
		<div className="max-w-4xl mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Notion-like Rich Text Editor</h1>

			<div className="mb-4">
				<h2 className="text-xl font-semibold mb-2">Features:</h2>
				<ul className="list-disc list-inside space-y-1 text-gray-600">
					<li>Block-based editing system</li>
					<li>
						Multiple block types (paragraph, headings, code, quote, divider,
						checklist)
					</li>
					<li>Floating toolbar for formatting</li>
					<li>Undo/Redo support (Ctrl+Z / Ctrl+Y)</li>
					<li>Keyboard shortcuts and navigation</li>
					<li>Extensible plugin system</li>
					<li>Performance optimizations with virtual scrolling</li>
					<li>Auto-save functionality</li>
					<li>Drag and drop block reordering</li>
					<li>Rich text formatting with search/replace</li>
					<li>Slash commands with visual menu</li>
				</ul>
			</div>

			<div className="mb-4">
				<h3 className="text-lg font-medium mb-2">Try it out:</h3>
				<p className="text-gray-600 mb-4">
					Start typing to create a paragraph. Press Enter to create new blocks.
					Select text to see the floating toolbar. Try different block types
					from the toolbar. Use slash commands like /checklist, /todo, or /task
					for checklist items.
				</p>
			</div>

			<OptimizedEditor
				value={value}
				onChange={setValue}
				placeholder="Start writing your document..."
				className="mb-8"
				enableVirtualScrolling={false}
				virtualScrollHeight={400}
			/>

			<div className="mt-8">
				<h3 className="text-lg font-medium mb-2">Current Value:</h3>
				<pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
					{value || "No content yet..."}
				</pre>
			</div>

			<div className="mt-8">
				<h3 className="text-lg font-medium mb-2">Keyboard Shortcuts:</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<strong>Navigation:</strong>
						<ul className="list-disc list-inside ml-4 mt-1">
							<li>Enter: New block</li>
							<li>Backspace: Delete block (if empty)</li>
							<li>Tab: Indent</li>
							<li>Space: Toggle checkbox (in checklist)</li>
						</ul>
					</div>
					<div>
						<strong>Formatting:</strong>
						<ul className="list-disc list-inside ml-4 mt-1">
							<li>Ctrl+Z: Undo</li>
							<li>Ctrl+Y: Redo</li>
							<li>Ctrl+A: Select all</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
