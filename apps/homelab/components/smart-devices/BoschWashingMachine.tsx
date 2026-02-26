"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Droplets, RefreshCw, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BENTO_CELL, CHART_COLORS } from "@/lib/constants";
import type { ConsumptionData } from "@/lib/data";

const TOOLTIP_STYLE = {
  backgroundColor: "#FBF7F0",
  border: "1px solid #E6D9C9",
  borderRadius: "8px",
  fontSize: "12px",
};

type ViewMode = "day" | "month";

function formatTooltipValue(
  value: number | string | readonly (number | string)[] | undefined,
  unit: string,
): [string, string] {
  const num = Array.isArray(value) ? Number(value[0]) : Number(value);
  return [
    `${Number.isFinite(num) ? num : 0} ${unit}`,
    unit === "L" ? "Water" : "Energy",
  ];
}

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

function makeBarClickHandler(
  selected: string | null,
  setSelected: (value: string | null) => void,
) {
  return (state: { activeLabel?: string | number | null }) => {
    if (state?.activeLabel) {
      const label = String(state.activeLabel);
      setSelected(label === selected ? null : label);
    }
  };
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
  colorDefault,
  colorActive,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  unit: string;
  consumption: ConsumptionData;
  colorDefault: string;
  colorActive: string;
  className?: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

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
          10,
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
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          onClick={makeBarClickHandler(selectedBar, setSelectedBar)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.2}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: viewMode === "day" ? 10 : 12 }}
            stroke="currentColor"
            opacity={0.5}
            axisLine={false}
            tickLine={false}
            interval={viewMode === "day" ? 4 : 0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.5}
            axisLine={false}
            tickLine={false}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              opacity: 0.5,
            }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => formatTooltipValue(v, unit)}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={viewMode === "day" ? 12 : 32}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.label}
                fill={
                  selectedBar === entry.label ? colorActive : colorDefault
                }
                opacity={selectedBar && selectedBar !== entry.label ? 0.4 : 1}
                className="cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
    badgeClass:
      "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
    dotClass: "bg-claude-mint",
  },
  idle: {
    label: "Idle",
    badgeClass:
      "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
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
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Lifetime Cycles */}
        <div className="rounded-2xl border border-claude-lavender/30 bg-gradient-to-br from-claude-lavender/25 to-claude-lavender/5 p-5 dark:border-claude-lavender/10 dark:from-claude-lavender/10 dark:to-claude-lavender/5">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-claude-lavender" />
            <p className="text-xs font-medium text-claude-lavender">
              Lifetime Cycles
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {data.lifetimeCycles}
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Total wash cycles
          </p>
        </div>

        {/* Avg Water / Month */}
        <div className="rounded-2xl border border-claude-sky/30 bg-gradient-to-br from-claude-sky/25 to-claude-sky/5 p-5 dark:border-claude-sky/10 dark:from-claude-sky/10 dark:to-claude-sky/5">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-claude-sky" />
            <p className="text-xs font-medium text-claude-sky">
              Avg Water / Month
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {data.waterConsumption.monthlyAverage}
            <span className="text-lg text-neutral-600 dark:text-neutral-400">
              {" "}
              L
            </span>
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Monthly average
          </p>
        </div>

        {/* Avg Energy / Month */}
        <div className="rounded-2xl border border-claude-peach/30 bg-gradient-to-br from-claude-peach/25 to-claude-peach/5 p-5 dark:border-claude-peach/10 dark:from-claude-peach/10 dark:to-claude-peach/5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-claude-peach" />
            <p className="text-xs font-medium text-claude-peach">
              Avg Energy / Month
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {data.energyConsumption.monthlyAverage}
            <span className="text-lg text-neutral-600 dark:text-neutral-400">
              {" "}
              kWh
            </span>
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Monthly average
          </p>
        </div>

        {/* Water Consumption Chart — full width */}
        <ConsumptionChart
          title="Water Consumption"
          icon={<Droplets className="h-4 w-4 text-claude-sky" />}
          unit="L"
          consumption={data.waterConsumption}
          colorDefault={CHART_COLORS.CLAUDE_SKY_LIGHT}
          colorActive={CHART_COLORS.CLAUDE_SKY}
          className="md:col-span-3"
        />

        {/* Energy Consumption Chart — full width */}
        <ConsumptionChart
          title="Energy Consumption"
          icon={<Zap className="h-4 w-4 text-claude-peach" />}
          unit="kWh"
          consumption={data.energyConsumption}
          colorDefault={CHART_COLORS.CLAUDE_SUNSHINE_LIGHT}
          colorActive={CHART_COLORS.CLAUDE_ORANGE}
          className="md:col-span-3"
        />
      </div>
    </div>
  );
}
