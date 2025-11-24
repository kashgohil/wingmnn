/**
 * Bar Chart Wrapper Component
 * Wraps recharts BarChart with consistent styling
 */

import {
	BarChart as RechartsBarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

interface BarChartProps {
	data: Array<Record<string, unknown>>;
	dataKey: string;
	bars: Array<{
		key: string;
		name: string;
		color?: string;
	}>;
	height?: number;
}

export function BarChart({
	data,
	dataKey,
	bars,
	height = 300,
}: BarChartProps) {
	return (
		<div className="w-full" style={{ minWidth: 0, height: `${height}px` }}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsBarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
					<XAxis
						dataKey={dataKey}
						className="text-xs"
						tick={{ fill: "currentColor" }}
					/>
					<YAxis className="text-xs" tick={{ fill: "currentColor" }} />
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--background))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "0",
						}}
					/>
					<Legend />
					{bars.map((bar) => (
						<Bar
							key={bar.key}
							dataKey={bar.key}
							name={bar.name}
							fill={bar.color || "hsl(var(--primary))"}
						/>
					))}
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
}

