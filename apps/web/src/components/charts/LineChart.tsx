/**
 * Line Chart Wrapper Component
 * Wraps recharts LineChart with consistent styling
 */

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface LineChartProps {
	data: Array<Record<string, unknown>>;
	dataKey: string;
	lines: Array<{
		key: string;
		name: string;
		color?: string;
	}>;
	height?: number;
}

export function LineChart({
	data,
	dataKey,
	lines,
	height = 300,
}: LineChartProps) {
	return (
		<div
			className="w-full"
			style={{ minWidth: 0, height: `${height}px` }}
		>
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<RechartsLineChart data={data}>
					<CartesianGrid
						strokeDasharray="3 3"
						className="stroke-muted"
					/>
					<XAxis
						dataKey={dataKey}
						className="text-xs"
						tick={{ fill: "currentColor" }}
					/>
					<YAxis
						className="text-xs"
						tick={{ fill: "currentColor" }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--background))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "0",
						}}
					/>
					<Legend iconType="line" />
					{lines.map((line) => (
						<Line
							key={line.key}
							type="monotone"
							dataKey={line.key}
							name={line.name}
							stroke={line.color || "hsl(var(--primary))"}
							strokeWidth={2}
							dot={{ r: 4 }}
						/>
					))}
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
}
