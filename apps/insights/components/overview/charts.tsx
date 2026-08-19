import { Donut } from "@duyet/components";
import type { CCUsageActivityByModelData } from "@/app/ai/types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Grid,
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

  const palette = [
    "#3b82f6",
    "#a855f7",
    "#22c55e",
    "#ec4899",
    "#f97316",
    "#ef4444",
  ];
  const slices = data.map((d, i) => ({
    name: compactName(d.name),
    value: d.pct || d.cost,
    pct: d.pct,
    cost: d.cost,
    color: `var(--chart-${(i % 6) + 1}, ${palette[i % 6]})`,
  }));

  return (
    <div className="flex min-h-[200px] min-w-0 flex-wrap items-center justify-center gap-6">
      <Donut
        ariaLabel={ariaLabel ?? "Cost share"}
        data={slices}
        size={180}
      />
      <ul className="grid gap-2 text-sm" aria-label="Cost share legend">
        {slices.map((slice) => (
          <li className="flex items-center gap-2" key={slice.name}>
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: slice.color }}
            />
            <span className="text-[var(--rd-text-2)]">
              {slice.name} ·{" "}
              {slice.pct > 0
                ? `${Math.round(slice.pct)}%`
                : `$${formatNumber(slice.cost)}`}
            </span>
          </li>
        ))}
      </ul>
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
