"use client";

import {
  ChartContainer,
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

interface TokenBarChartProps {
  data: Array<Record<string, unknown>>;
  index: string;
  categories: string[];
  className?: string;
  stack?: boolean;
  showInThousands?: boolean;
  /** Chart height in pixels */
  height?: number;
}

// Format large numbers with appropriate units (K, M, B)
function formatYAxisLabel(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

/**
 * Client-side wrapper for token usage charts with distinct colors
 * Input Tokens: Blue (chart-1)
 * Output Tokens: Orange (chart-2)
 * Cache Tokens: Purple (chart-3)
 */
export function TokenBarChart({
  data,
  index,
  categories,
  className,
  stack = false,
  showInThousands = false,
  height,
}: TokenBarChartProps) {
  const valueFormatter = showInThousands
    ? (value: unknown) => `${value}K`
    : undefined;

  // Explicit color mapping for token categories using CSS variables
  const chartConfig: ChartConfig = {
    "Input Tokens": {
      label: "Input Tokens",
      color: "var(--chart-1)",
    },
    "Output Tokens": {
      label: "Output Tokens",
      color: "var(--chart-2)",
    },
    "Cache Tokens": {
      label: "Cache Tokens",
      color: "var(--chart-3)",
    },
  };

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        maxBarSize={50}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxisLabel}
        />
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
              fill={chartConfig[category]?.color || "hsl(var(--chart-1))"}
              radius={radius}
            />
          );
        })}
      </RechartsBarChart>
    </ChartContainer>
  );
}
