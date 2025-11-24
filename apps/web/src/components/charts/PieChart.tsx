/**
 * Pie Chart Wrapper Component
 * Wraps recharts PieChart with consistent styling
 */

import {
	Cell,
	Legend,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface PieChartProps {
	data: Array<{
		name: string;
		value: number;
		color?: string;
	}>;
	height?: number;
	colors?: string[];
}

const DEFAULT_COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--secondary))",
	"#8884d8",
	"#82ca9d",
	"#ffc658",
	"#ff7300",
];

export function PieChart({
	data,
	height = 300,
	colors = DEFAULT_COLORS,
}: PieChartProps) {
	return (
		<div
			className="w-full"
			style={{ minWidth: 0, height: `${height}px` }}
		>
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<RechartsPieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={({ name, percent }) =>
							`${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
						}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.color || colors[index % colors.length]}
							/>
						))}
					</Pie>
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--background))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "0",
						}}
					/>
					<Legend iconType="square" />
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
}
