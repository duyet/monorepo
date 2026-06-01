import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CCUsageActivityByModelData } from "@/app/ai/types";
import {
  CHART_ACCENT,
  CHART_FOREGROUND,
  CHART_SUBTLE,
  CHART_TOOLTIP_BACKGROUND,
  CHART_TOOLTIP_TEXT,
} from "./constants";
import { useHydrated, useElementWidth } from "./hooks";
import { formatNumber, compactName } from "./helpers";

function InsightAreaChart({
  data,
  keys,
  labelMap,
  accentKey,
}: {
  data: Array<Record<string, number | string>>;
  keys: string[];
  labelMap: Record<string, string>;
  accentKey?: string;
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No data available for this period." />;
  }

  const colorFor = (key: string, index: number) => {
    if (accentKey && key === accentKey) return CHART_ACCENT;
    return index === 0 ? CHART_FOREGROUND : CHART_SUBTLE;
  };

  return (
    <div className="h-[200px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <AreaChart
          data={data}
          height={200}
          margin={{ bottom: 0, left: -12, right: 4, top: 8 }}
          width={width}
        >
          <defs>
            {keys.map((key, index) => (
              <linearGradient
                id={`fill-${key}`}
                key={key}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colorFor(key, index)}
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor={colorFor(key, index)}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
            contentStyle={{
              background: CHART_TOOLTIP_BACKGROUND,
              border: "0",
              borderRadius: "2px",
              color: CHART_TOOLTIP_TEXT,
              fontSize: "12px",
              padding: "8px 10px",
            }}
            formatter={(value, name) => [
              typeof value === "number" ? formatNumber(value) : value,
              labelMap[String(name)] ?? name,
            ]}
          />
          {keys.map((key, index) => (
            <Area
              dataKey={key}
              fill={`url(#fill-${key})`}
              key={key}
              name={labelMap[key] ?? key}
              stroke={colorFor(key, index)}
              strokeWidth={1.5}
              type="monotone"
            />
          ))}
        </AreaChart>
      )}
    </div>
  );
}

const STACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function InsightStackedBarChart({
  data,
}: {
  data: CCUsageActivityByModelData[];
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No model breakdown available." />;
  }

  const modelKeys = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "date"))),
  );

  return (
    <div className="h-[200px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <BarChart
          data={data}
          height={200}
          margin={{ bottom: 0, left: -12, right: 4, top: 8 }}
          width={width}
        >
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)" }}
            contentStyle={{
              background: CHART_TOOLTIP_BACKGROUND,
              border: "0",
              borderRadius: "2px",
              color: CHART_TOOLTIP_TEXT,
              fontSize: "12px",
              padding: "8px 10px",
            }}
            formatter={(value, name) => [
              `${formatNumber(Number(value))}K`,
              compactName(String(name)),
            ]}
          />
          {modelKeys.map((key, index) => (
            <Bar
              dataKey={key}
              fill={STACK_COLORS[index % STACK_COLORS.length]}
              key={key}
              stackId="tokens"
            />
          ))}
        </BarChart>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export { InsightAreaChart, InsightStackedBarChart, EmptyChart, STACK_COLORS };
