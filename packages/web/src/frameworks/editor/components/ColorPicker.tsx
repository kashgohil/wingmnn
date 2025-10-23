import React, { useEffect, useRef, useState } from "react";

interface ColorPickerProps {
	onColorSelect: (color: string) => void;
	label: string;
	defaultColor?: string;
}

const PRESET_COLORS = [
	"#000000",
	"#333333",
	"#666666",
	"#999999",
	"#CCCCCC",
	"#FFFFFF",
	"#FF0000",
	"#FF6600",
	"#FFCC00",
	"#00FF00",
	"#0066FF",
	"#6600FF",
	"#FF0066",
	"#FF3366",
	"#FF6699",
	"#FF99CC",
	"#FFCCFF",
	"#CC99FF",
	"#9966FF",
	"#6633FF",
	"#3300FF",
	"#0066CC",
	"#0099FF",
	"#00CCFF",
	"#00FFFF",
	"#00FFCC",
	"#00FF99",
	"#00FF66",
	"#00FF33",
	"#66FF00",
	"#99FF00",
	"#CCFF00",
	"#FFFF00",
	"#FFCC00",
	"#FF9900",
	"#FF6600",
];

export function ColorPicker({
	onColorSelect,
	label,
	defaultColor = "#000000",
}: ColorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedColor, setSelectedColor] = useState(defaultColor);
	const [customColor, setCustomColor] = useState("#000000");
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleColorSelect = (color: string) => {
		setSelectedColor(color);
		onColorSelect(color);
		setIsOpen(false);
	};

	const handleCustomColorChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const color = event.target.value;
		setCustomColor(color);
		setSelectedColor(color);
		onColorSelect(color);
	};

	return (
		<div
			className="relative"
			ref={pickerRef}
		>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
				title={label}
			>
				<span
					className="w-4 h-4 rounded border border-gray-300"
					style={{ backgroundColor: selectedColor }}
				/>
				<span className="text-xs">{label}</span>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
					<div className="mb-2">
						<label className="block text-xs font-medium text-gray-700 mb-1">
							Custom Color:
						</label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={customColor}
								onChange={handleCustomColorChange}
								className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
							/>
							<input
								type="text"
								value={customColor}
								onChange={(e) => setCustomColor(e.target.value)}
								placeholder="#000000"
								className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
							/>
						</div>
					</div>

					<div className="mb-2">
						<label className="block text-xs font-medium text-gray-700 mb-1">
							Preset Colors:
						</label>
						<div className="grid grid-cols-6 gap-1">
							{PRESET_COLORS.map((color) => (
								<button
									key={color}
									onClick={() => handleColorSelect(color)}
									className={`w-6 h-6 rounded border-2 cursor-pointer hover:scale-110 transition-transform ${
										selectedColor === color
											? "border-blue-500"
											: "border-gray-300"
									}`}
									style={{ backgroundColor: color }}
									title={color}
								/>
							))}
						</div>
					</div>

					<div className="flex gap-1">
						<button
							onClick={() => handleColorSelect("#000000")}
							className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
						>
							Reset
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
