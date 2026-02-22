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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSmartDevices } from "@/hooks/useDashboard";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  fontSize: "12px",
};

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
          ? "text-red-600 dark:text-red-400"
          : isBelow
            ? "text-green-600 dark:text-green-400"
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

const STATUS_CONFIG = {
  online: {
    label: "Running",
    badgeClass:
      "bg-claude-mint/30 text-green-700 dark:bg-claude-mint/10 dark:text-green-400",
    dotClass: "bg-green-500",
  },
  idle: {
    label: "Idle",
    badgeClass:
      "bg-claude-mint/30 text-green-700 dark:bg-claude-mint/10 dark:text-green-400",
    dotClass: "bg-green-500",
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
  const [selectedWaterMonth, setSelectedWaterMonth] = useState<string | null>(
    null,
  );
  const [selectedEnergyMonth, setSelectedEnergyMonth] = useState<string | null>(
    null,
  );

  const selectedWater = useMemo(() => {
    if (!selectedWaterMonth) return null;
    return data.waterConsumption.monthly.find(
      (m) => m.month === selectedWaterMonth,
    );
  }, [selectedWaterMonth, data.waterConsumption.monthly]);

  const selectedEnergy = useMemo(() => {
    if (!selectedEnergyMonth) return null;
    return data.energyConsumption.monthly.find(
      (m) => m.month === selectedEnergyMonth,
    );
  }, [selectedEnergyMonth, data.energyConsumption.monthly]);

  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-claude-lavender dark:bg-claude-lavender/20">
          <RefreshCw className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-claude-lavender p-5 dark:bg-claude-lavender/20">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
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

        <div className="rounded-3xl bg-claude-sky p-5 dark:bg-claude-sky/20">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
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

        <div className="rounded-3xl bg-claude-yellow p-5 dark:bg-claude-yellow/20">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Water Consumption Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Water Consumption
              </CardTitle>
              {selectedWater && (
                <ComparisonBadge
                  value={selectedWater.value}
                  average={data.waterConsumption.monthlyAverage}
                />
              )}
            </div>
            {selectedWater && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {selectedWater.month}:{" "}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedWater.value} L
                </span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.waterConsumption.monthly}
                onClick={makeBarClickHandler(
                  selectedWaterMonth,
                  setSelectedWaterMonth,
                )}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Liters",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    opacity: 0.5,
                  }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => formatTooltipValue(v, "L")}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {data.waterConsumption.monthly.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={
                        selectedWaterMonth === entry.month
                          ? "#4dabf7"
                          : "#b3d9ff"
                      }
                      opacity={
                        selectedWaterMonth && selectedWaterMonth !== entry.month
                          ? 0.4
                          : 1
                      }
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Monthly avg:{" "}
                <span className="font-medium">
                  {data.waterConsumption.monthlyAverage} L
                </span>
              </span>
              <span>Click a bar to compare</span>
            </div>
          </CardContent>
        </Card>

        {/* Energy Consumption Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Energy Consumption
              </CardTitle>
              {selectedEnergy && (
                <ComparisonBadge
                  value={selectedEnergy.value}
                  average={data.energyConsumption.monthlyAverage}
                />
              )}
            </div>
            {selectedEnergy && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {selectedEnergy.month}:{" "}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedEnergy.value} kWh
                </span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.energyConsumption.monthly}
                onClick={makeBarClickHandler(
                  selectedEnergyMonth,
                  setSelectedEnergyMonth,
                )}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "kWh",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    opacity: 0.5,
                  }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => formatTooltipValue(v, "kWh")}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {data.energyConsumption.monthly.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={
                        selectedEnergyMonth === entry.month
                          ? "#f59f00"
                          : "#f0d9a8"
                      }
                      opacity={
                        selectedEnergyMonth &&
                        selectedEnergyMonth !== entry.month
                          ? 0.4
                          : 1
                      }
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Monthly avg:{" "}
                <span className="font-medium">
                  {data.energyConsumption.monthlyAverage} kWh
                </span>
              </span>
              <span>Click a bar to compare</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
