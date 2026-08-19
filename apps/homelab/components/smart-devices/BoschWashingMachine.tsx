"use client";

import { ArrowDown, ArrowUp, Droplets, RefreshCw, Zap } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Bar } from "@/components/dither-kit/bar";
import { BarChart } from "@/components/dither-kit/bar-chart";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Grid } from "@/components/dither-kit/grid";
import type { DitherColor } from "@/components/dither-kit/palette";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BENTO_CELL } from "@/lib/constants";
import type { ConsumptionData } from "@/lib/data";

type ViewMode = "day" | "month";

function ComparisonBadge({
  value,
  average,
}: {
  value: number;
  average: number;
}) {
  const diff = average === 0 ? 0 : ((value - average) / average) * 100;
  const isAbove = diff > 0;
  const isBelow = diff < 0;
  const percentage = Math.abs(diff).toFixed(0);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isAbove
          ? "text-claude-coral"
          : isBelow
            ? "text-claude-mint"
            : "text-neutral-500 dark:text-neutral-400"
      }`}
    >
      {isAbove && <ArrowUp className="h-3 w-3" />}
      {isBelow && <ArrowDown className="h-3 w-3" />}
      {percentage}%
      <span className="text-neutral-500 dark:text-neutral-400">vs average</span>
    </span>
  );
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
      <button
        onClick={() => onChange("day")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          mode === "day"
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        Day
      </button>
      <button
        onClick={() => onChange("month")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          mode === "month"
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        Month
      </button>
    </div>
  );
}

function ConsumptionChart({
  title,
  icon,
  unit,
  consumption,
  color,
  className,
}: {
  title: string;
  icon: ReactNode;
  unit: string;
  consumption: ConsumptionData;
  color: DitherColor;
  className?: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const config: ChartConfig = useMemo(
    () => ({ value: { label: title, color } }),
    [title, color],
  );

  const chartData = useMemo(() => {
    if (viewMode === "day") {
      return consumption.daily.slice(-30).map((d) => ({
        label: d.date,
        value: d.value,
      }));
    }
    return consumption.monthly.map((m) => ({
      label: m.month,
      value: m.value,
    }));
  }, [viewMode, consumption.daily, consumption.monthly]);

  const selectedEntry = useMemo(() => {
    if (!selectedBar) return null;
    return chartData.find((d) => d.label === selectedBar);
  }, [selectedBar, chartData]);

  const dailyAverage = useMemo(() => {
    const withValues = consumption.daily.filter((d) => d.value > 0);
    if (withValues.length === 0) return 0;
    return (
      Math.round(
        (withValues.reduce((sum, d) => sum + d.value, 0) / withValues.length) *
          10
      ) / 10
    );
  }, [consumption.daily]);

  const currentAverage =
    viewMode === "month" ? consumption.monthlyAverage : dailyAverage;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedBar(null);
  };

  return (
    <div className={`${BENTO_CELL} ${className ?? ""}`}>
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {icon}
            {title}
          </h4>
          <div className="flex items-center gap-2">
            {selectedEntry && (
              <ComparisonBadge
                value={selectedEntry.value}
                average={currentAverage}
              />
            )}
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>
        {selectedEntry && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {selectedEntry.label}:{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {selectedEntry.value} {unit}
            </span>
          </p>
        )}
      </div>
      <div className="h-[220px] w-full min-w-0">
        <BarChart
          data={chartData}
          config={config}
          bloom="aura"
          onHoverChange={(index) => {
            setSelectedBar(index == null ? null : (chartData[index]?.label ?? null));
          }}
        >
          <Grid />
          <XAxis dataKey="label" maxTicks={viewMode === "day" ? 6 : 12} />
          <YAxis />
          <Tooltip labelKey="label" valueFormatter={(v) => `${v} ${unit}`} />
          <Bar dataKey="value" variant="gradient" />
        </BarChart>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          {viewMode === "month" ? "Monthly" : "Daily"} avg:{" "}
          <span className="font-medium">
            {currentAverage} {unit}
          </span>
        </span>
        <span>
          {viewMode === "day" ? "Last 30 days" : "Click a bar to compare"}
        </span>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  online: {
    label: "Running",
    badgeClass: "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
    dotClass: "bg-claude-mint",
  },
  idle: {
    label: "Idle",
    badgeClass: "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
    dotClass: "bg-claude-mint",
  },
  offline: {
    label: "Offline",
    badgeClass:
      "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
    dotClass: "bg-neutral-400",
  },
} as const;

export function BoschWashingMachine() {
  const { boschWashingMachine: data } = useSmartDevices();
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div className="space-y-3">
      {/* Device Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-claude-lavender/25 dark:bg-claude-lavender/10">
          <RefreshCw className="h-5 w-5 text-claude-lavender" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {data.model}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Washing Machine
          </p>
        </div>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.badgeClass}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
          />
          {statusConfig.label}
        </span>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={`${BENTO_CELL} bg-claude-lavender/15 dark:bg-claude-lavender/10`}>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-claude-lavender" />
            <p className="text-[11px] font-medium text-claude-lavender">
              Lifetime cycles
            </p>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
            {data.lifetimeCycles}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Total wash cycles</p>
        </div>

        <div className={`${BENTO_CELL} bg-claude-sky/15 dark:bg-claude-sky/10`}>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-claude-sky" />
            <p className="text-[11px] font-medium text-claude-sky">Avg water / month</p>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
            {data.waterConsumption.monthlyAverage}
            <span className="ml-1 text-sm font-normal text-muted-foreground">L</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Monthly average</p>
        </div>

        <div className={`${BENTO_CELL} bg-claude-peach/20 dark:bg-claude-peach/10`}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-claude-peach" />
            <p className="text-[11px] font-medium text-claude-peach">Avg energy / month</p>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
            {data.energyConsumption.monthlyAverage}
            <span className="ml-1 text-sm font-normal text-muted-foreground">kWh</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Monthly average</p>
        </div>

        {/* Water Consumption Chart — full width */}
        <ConsumptionChart
          title="Water Consumption"
          icon={<Droplets className="h-4 w-4 text-claude-sky" />}
          unit="L"
          consumption={data.waterConsumption}
          color="blue"
          className="md:col-span-3"
        />

        {/* Energy Consumption Chart — full width */}
        <ConsumptionChart
          title="Energy Consumption"
          icon={<Zap className="h-4 w-4 text-claude-peach" />}
          unit="kWh"
          consumption={data.energyConsumption}
          color="orange"
          className="md:col-span-3"
        />
      </div>
    </div>
  );
}
