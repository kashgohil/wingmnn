import { useState } from "react";
import { Editor } from "../components/editor";

export function EditorTest() {
	const [value, setValue] = useState("Hello, this is a test!");

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Editor Test</h1>
			<Editor
				value={value}
				onChange={setValue}
				placeholder="Start typing..."
			/>
			<div className="mt-4">
				<p>Current value: {value}</p>
			</div>
		</div>
	);
}
