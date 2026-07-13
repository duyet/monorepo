import type { CCUsageActivityByModelData } from "@/app/ai/types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Grid,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  type ChartConfig,
} from "@/components/dither-kit";
import { formatNumber, compactName } from "./helpers";

const COLORS = {
  accent: "blue",
  secondary: "purple",
  tertiary: "green",
  quaternary: "pink",
  quinary: "orange",
  senary: "red",
} as const;

const BAR_COLORS = [
  "blue",
  "purple",
  "green",
  "pink",
  "orange",
  "red",
] as const;

function InsightAreaChart({
  data,
  keys,
  labelMap,
  ariaLabel,
}: {
  data: Array<Record<string, number | string>>;
  keys: string[];
  labelMap: Record<string, string>;
  ariaLabel?: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label="No data available for this period." />;
  }

  const colorNames = [COLORS.accent, COLORS.secondary, COLORS.tertiary];
  const config: ChartConfig = Object.fromEntries(
    keys.map((key, i) => [
      key,
      { label: labelMap[key] ?? key, color: colorNames[i % colorNames.length] },
    ])
  );

  return (
    <div aria-label={ariaLabel} className="h-[200px] min-w-0" role="img">
      <AreaChart data={data} config={config} stackType="default">
        <Grid />
        <XAxis dataKey="date" maxTicks={6} />
        <YAxis tickCount={4} />
        {keys.map((key) => (
          <Area key={key} dataKey={key} />
        ))}
        <Tooltip labelKey="date" />
      </AreaChart>
    </div>
  );
}

function InsightStackedBarChart({
  data,
  ariaLabel,
}: {
  data: CCUsageActivityByModelData[];
  ariaLabel?: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label="No model breakdown available." />;
  }

  const modelKeys = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "date")))
  );

  const config: ChartConfig = Object.fromEntries(
    modelKeys.map((key, i) => [
      key,
      { label: compactName(key), color: BAR_COLORS[i % BAR_COLORS.length] },
    ])
  );

  return (
    <div aria-label={ariaLabel} className="h-[200px] min-w-0" role="img">
      <BarChart data={data} config={config} stackType="stacked">
        <Grid />
        <XAxis dataKey="date" maxTicks={6} />
        <YAxis tickCount={4} tickFormatter={(v) => `${v}K`} />
        {modelKeys.map((key) => (
          <Bar key={key} dataKey={key} />
        ))}
        <Tooltip labelKey="date" valueFormatter={(v) => `${formatNumber(v)}K`} />
      </BarChart>
    </div>
  );
}

/** Donut of per-model cost share. */
function InsightDonutChart({
  data,
  ariaLabel,
}: {
  data: Array<{ name: string; cost: number; pct: number }>;
  ariaLabel?: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label="No model cost data available." />;
  }

  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: compactName(d.name), color: BAR_COLORS[i % BAR_COLORS.length] },
    ])
  );

  return (
    <div aria-label={ariaLabel} className="h-[200px] min-w-0" role="img">
      <PieChart data={data} dataKey="pct" nameKey="name" config={config} innerRadius={0.55}>
        <Pie />
        <Legend isClickable align="center" />
        <Tooltip />
      </PieChart>
    </div>
  );
}

/** Grouped/weekday or hourly distribution as a thin bar chart. */
function InsightDistributionChart({
  data,
  dataKey,
  ariaLabel,
}: {
  data: Array<{ label: string; [k: string]: number | string }>;
  dataKey: string;
  ariaLabel?: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label="No distribution data available." />;
  }

  const config: ChartConfig = {
    [dataKey]: { label: "Tokens", color: COLORS.accent },
  };

  const tickEvery = data.length > 12 ? Math.ceil(data.length / 12) : 1;

  return (
    <div aria-label={ariaLabel} className="h-[180px] min-w-0" role="img">
      <BarChart data={data} config={config}>
        <Grid />
        <XAxis
          dataKey="label"
          maxTicks={Math.ceil(data.length / tickEvery)}
        />
        <YAxis tickCount={4} tickFormatter={(v) => formatCompactTick(v)} />
        <Bar dataKey={dataKey} />
        <Tooltip labelKey="label" />
      </BarChart>
    </div>
  );
}

function formatCompactTick(v: number) {
  if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export {
  InsightAreaChart,
  InsightStackedBarChart,
  InsightDonutChart,
  InsightDistributionChart,
  EmptyChart,
  COLORS,
};
