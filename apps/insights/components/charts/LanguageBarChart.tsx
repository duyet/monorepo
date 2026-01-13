"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

interface LanguageData {
  name: string;
  percent: number;
  color?: string;
}

interface LanguageBarChartProps {
  data: LanguageData[];
  className?: string;
}

interface LabelProps {
  payload?: {
    isShortBar?: boolean;
    percent?: number;
    name?: string;
    displayName?: string;
  };
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number | boolean | null;
}

const chartConfig = {
  percent: {
    label: "Usage %",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

// Truncate text to fit within max length
function truncateText(text: string, maxLength = 20): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

// Custom label component that shows model name and percentage
const CombinedLabel = (props: LabelProps) => {
  const { payload, x = 0, y = 0, width = 0, height = 0, value } = props;

  // Handle case where payload might be undefined
  if (!payload) return null;

  // Convert string|number to number
  const numX = typeof x === "string" ? Number.parseFloat(x) : x;
  const numY = typeof y === "string" ? Number.parseFloat(y) : y;
  const numWidth = typeof width === "string" ? Number.parseFloat(width) : width;
  const numHeight =
    typeof height === "string" ? Number.parseFloat(height) : height;
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value;

  const isShortBar = payload.isShortBar || (payload.percent || 0) < 15;
  const rawName = payload.displayName || payload.name || "";
  const displayName = truncateText(rawName, 20);
  const percentage = `${Number(numValue || payload.percent || 0).toFixed(1)}%`;

  // Get computed colors from CSS variables
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <g>
      {/* Model name - always on the left outside */}
      <text
        x={numX - 8}
        y={numY + numHeight / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={12}
        fill={isDark ? "#f5f5f5" : "#1a1a1a"}
        style={{ userSelect: "none" }}
      >
        {displayName}
      </text>

      {/* Percentage - inside bar for long bars, outside for short bars */}
      <text
        x={isShortBar ? numX + numWidth + 8 : numX + numWidth - 8}
        y={numY + numHeight / 2}
        textAnchor={isShortBar ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={500}
        fill={isShortBar ? (isDark ? "#f5f5f5" : "#1a1a1a") : "#ffffff"}
        style={{ userSelect: "none" }}
      >
        {percentage}
      </text>
    </g>
  );
};

export function LanguageBarChart({ data, className }: LanguageBarChartProps) {
  // Format data for the chart and limit to top 8
  // Calculate threshold for short bars (e.g., less than 15% means text likely won't fit inside)
  const chartData = data.slice(0, 8).map((language) => ({
    name: language.name,
    percent: language.percent,
    displayName: language.name,
    isShortBar: language.percent < 15, // Threshold for moving text outside
  }));

  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          right: 80, // Space for percentage outside short bars
          left: 150, // Space for model names on the left
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          hide
        />
        <XAxis dataKey="percent" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="percent" fill="var(--chart-1)" radius={4}>
          <LabelList content={CombinedLabel} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
