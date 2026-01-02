"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: Array<Record<string, unknown>>;
  index: string;
  categories: string[];
  className?: string;
  stack?: boolean;
  legend?: boolean;
  valueFormatter?: (value: unknown) => string;
  /** Use logarithmic scale for Y-axis (useful for data with large value ranges) */
  logScale?: boolean;
  /** Hide Y-axis ticks */
  hideYAxis?: boolean;
  /** Chart height in pixels */
  height?: number;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(30, 80%, 55%)",   // orange
  "hsl(280, 65%, 60%)",  // purple
  "hsl(180, 60%, 45%)",  // teal
  "hsl(340, 75%, 55%)",  // pink
  "hsl(60, 70%, 50%)",   // yellow
  "hsl(200, 70%, 50%)",  // sky blue
  "hsl(140, 60%, 45%)",  // green
];

// Format large numbers with appropriate units (K, M, B)
function formatYAxisLabel(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function BarChart({
  data,
  index,
  categories,
  className,
  stack = false,
  legend = false,
  valueFormatter,
  logScale = false,
  hideYAxis = false,
  height,
}: BarChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 20, right: 30, left: 20, bottom: legend ? 60 : 5 }}
        maxBarSize={50}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        {!hideYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisLabel}
          />
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={
                valueFormatter ? (value) => valueFormatter(value) : undefined
              }
            />
          }
        />
        {categories.map((category, i) => {
          // For stacked bars, only the last (top) bar should have rounded corners
          const isLastInStack = stack && i === categories.length - 1;
          const radius: [number, number, number, number] = stack
            ? isLastInStack
              ? [4, 4, 0, 0]
              : [0, 0, 0, 0]
            : [4, 4, 0, 0];

          return (
            <Bar
              key={category}
              dataKey={category}
              stackId={stack ? "stack" : undefined}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={radius}
            />
          );
        })}
        {legend && (
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign="bottom"
          />
        )}
      </RechartsBarChart>
    </ChartContainer>
  );
}
