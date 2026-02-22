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

function ComparisonBadge({
  value,
  average,
}: {
  value: number;
  average: number;
}) {
  const diff = ((value - average) / average) * 100;
  const isAbove = diff > 0;
  const percentage = Math.abs(diff).toFixed(0);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isAbove
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400"
      }`}
    >
      {isAbove ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {percentage}%
      <span className="text-neutral-500 dark:text-neutral-400">vs average</span>
    </span>
  );
}

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

  const tooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c5c5ff] dark:bg-[#c5c5ff]/20">
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
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#a8d5ba]/30 px-3 py-1 text-xs font-medium text-green-700 dark:bg-[#a8d5ba]/10 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {data.status === "idle" ? "Idle" : "Running"}
        </span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-[#c5c5ff] p-5 dark:bg-[#c5c5ff]/20">
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

        <div className="rounded-3xl bg-[#b3d9ff] p-5 dark:bg-[#b3d9ff]/20">
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

        <div className="rounded-3xl bg-[#f0d9a8] p-5 dark:bg-[#f0d9a8]/20">
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
                onClick={(state) => {
                  if (state?.activeLabel) {
                    setSelectedWaterMonth(
                      String(state.activeLabel) === selectedWaterMonth
                        ? null
                        : String(state.activeLabel),
                    );
                  }
                }}
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
                  contentStyle={tooltipStyle}
                  formatter={(value: number | undefined) => [
                    `${value ?? 0} L`,
                    "Water",
                  ]}
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
                onClick={(state) => {
                  if (state?.activeLabel) {
                    setSelectedEnergyMonth(
                      String(state.activeLabel) === selectedEnergyMonth
                        ? null
                        : String(state.activeLabel),
                    );
                  }
                }}
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
                  contentStyle={tooltipStyle}
                  formatter={(value: number | undefined) => [
                    `${value ?? 0} kWh`,
                    "Energy",
                  ]}
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
