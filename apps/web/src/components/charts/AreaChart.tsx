/**
 * Area Chart Wrapper Component
 * Wraps recharts AreaChart with consistent styling
 */

import {
	Area,
	CartesianGrid,
	Legend,
	AreaChart as RechartsAreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface AreaChartProps {
	data: Array<Record<string, unknown>>;
	dataKey: string;
	areas: Array<{
		key: string;
		name: string;
		color?: string;
	}>;
	height?: number;
}

export function AreaChart({
	data,
	dataKey,
	areas,
	height = 300,
}: AreaChartProps) {
	return (
		<div
			className="w-full"
			style={{ minWidth: 0, height: `${height}px` }}
		>
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<RechartsAreaChart data={data}>
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
					<Legend iconType="square" />
					{areas.map((area) => (
						<Area
							key={area.key}
							type="monotone"
							dataKey={area.key}
							name={area.name}
							stroke={area.color || "hsl(var(--primary))"}
							fill={area.color || "hsl(var(--primary))"}
							fillOpacity={0.6}
						/>
					))}
				</RechartsAreaChart>
			</ResponsiveContainer>
		</div>
	);
}
