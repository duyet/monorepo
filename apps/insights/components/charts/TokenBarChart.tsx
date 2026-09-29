"use client";

import { formatNumber } from "@duyet/libs";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
          // formatNumber already returns "0" below 1000, so the axis origin
          // needs no call-site zero guard (the old local one was a no-op).
          tickFormatter={formatNumber}
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
