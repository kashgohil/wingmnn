import React, { useEffect, useRef, useState } from "react";

interface LinkDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, text: string) => void;
	initialUrl?: string;
	initialText?: string;
}

export function LinkDialog({
	isOpen,
	onClose,
	onConfirm,
	initialUrl = "",
	initialText = "",
}: LinkDialogProps) {
	const [url, setUrl] = useState(initialUrl);
	const [text, setText] = useState(initialText);
	const [isValidUrl, setIsValidUrl] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		// Basic URL validation
		const urlPattern =
			/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		setIsValidUrl(url === "" || urlPattern.test(url));
	}, [url]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isValidUrl && url.trim()) {
			onConfirm(url.trim(), text.trim() || url.trim());
			onClose();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div
				className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-[90vw]"
				onKeyDown={handleKeyDown}
			>
				<h3 className="text-lg font-semibold mb-4">Add Link</h3>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Link Text:
						</label>
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Link text"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							URL:
						</label>
						<input
							ref={inputRef}
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com"
							className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								!isValidUrl && url ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{!isValidUrl && url && (
							<p className="text-red-500 text-xs mt-1">
								Please enter a valid URL
							</p>
						)}
					</div>

					<div className="flex gap-2 justify-end">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!isValidUrl || !url.trim()}
							className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Add Link
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
