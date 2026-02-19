"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface BaseChartProps {
  data: Array<Record<string, unknown>>;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

interface CompactAreaChartProps extends BaseChartProps {
  index: string;
  categories: string[];
}

export function CompactAreaChart({
  data,
  index,
  categories,
  className,
  height = 200,
  showGrid = false,
  showTooltip = true,
}: CompactAreaChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={chartConfig} className={className}>
      <AreaChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {categories.map((category, i) => (
          <Area
            key={category}
            dataKey={category}
            type="monotone"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

interface CompactLineChartProps extends BaseChartProps {
  index: string;
  categories: string[];
}

export function CompactLineChart({
  data,
  index,
  categories,
  className,
  height = 200,
  showGrid = false,
  showTooltip = true,
}: CompactLineChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={chartConfig} className={className}>
      <LineChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {categories.map((category, i) => (
          <Line
            key={category}
            dataKey={category}
            type="monotone"
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

interface CompactBarChartProps extends BaseChartProps {
  index: string;
  categories: string[];
  horizontal?: boolean;
}

export function CompactBarChart({
  data,
  index,
  categories,
  className,
  height = 200,
  showGrid = false,
  showTooltip = true,
  horizontal = false,
}: CompactBarChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        layout={horizontal ? "horizontal" : "vertical"}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        {horizontal ? (
          <>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey={index}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: "var(--muted-foreground)" }}
            />
          </>
        ) : (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
          />
        )}
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

interface MiniSparklineProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  className?: string;
  height?: number;
  color?: string;
}

export function MiniSparkline({
  data,
  dataKey,
  className,
  height = 40,
  color = CHART_COLORS[0],
}: MiniSparklineProps) {
  const chartConfig: ChartConfig = {
    [dataKey]: { label: dataKey, color },
  };

  return (
    <ChartContainer config={chartConfig} className={className}>
      <AreaChart
        accessibilityLayer
        data={data}
        height={height}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <Area
          dataKey={dataKey}
          type="monotone"
          fill={color}
          stroke={color}
          fillOpacity={0.4}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

interface CompactPieChartProps extends BaseChartProps {
  nameKey: string;
  valueKey: string;
  innerRadius?: number;
}

export function CompactPieChart({
  data,
  nameKey,
  valueKey,
  className,
  height = 200,
  showTooltip = true,
  innerRadius = 0,
}: CompactPieChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((item, i) => [
      item[nameKey] as string,
      {
        label: item[nameKey] as string,
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    ])
  );

  return (
    <ChartContainer config={chartConfig} className={className}>
      <PieChart height={height}>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={height / 2 - 10}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
      </PieChart>
    </ChartContainer>
  );
}
