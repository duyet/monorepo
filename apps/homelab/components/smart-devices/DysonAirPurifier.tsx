"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSmartDevices } from "@/hooks/useDashboard";
import type { AirQualityLevel } from "@/lib/data";

const AQ_COLORS: Record<AirQualityLevel, string> = {
  good: "#22c55e",
  fair: "#eab308",
  moderate: "#f97316",
  poor: "#ef4444",
  "very-poor": "#7c2d12",
};

const AQ_BG: Record<AirQualityLevel, string> = {
  good: "bg-green-100 dark:bg-green-900/30",
  fair: "bg-yellow-100 dark:bg-yellow-900/30",
  moderate: "bg-orange-100 dark:bg-orange-900/30",
  poor: "bg-red-100 dark:bg-red-900/30",
  "very-poor": "bg-red-200 dark:bg-red-900/50",
};

const AQ_TEXT: Record<AirQualityLevel, string> = {
  good: "text-green-700 dark:text-green-400",
  fair: "text-yellow-700 dark:text-yellow-400",
  moderate: "text-orange-700 dark:text-orange-400",
  poor: "text-red-700 dark:text-red-400",
  "very-poor": "text-red-800 dark:text-red-300",
};

const AQ_LABEL: Record<AirQualityLevel, string> = {
  good: "Good",
  fair: "Fair",
  moderate: "Moderate",
  poor: "Poor",
  "very-poor": "Very Poor",
};

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  fontSize: "12px",
};

const STATUS_CONFIG = {
  online: {
    label: "Running",
    badgeClass:
      "bg-claude-mint/30 text-green-700 dark:bg-claude-mint/10 dark:text-green-400",
    dotClass: "bg-green-500",
  },
  idle: {
    label: "Standby",
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

type AqMetric = "pm25" | "pm10" | "voc" | "no2" | "hcho";

const METRIC_CONFIG: Record<
  AqMetric,
  { label: string; color: string; unit: string }
> = {
  pm25: { label: "PM2.5", color: "#8b5cf6", unit: "\u00b5g/m\u00b3" },
  pm10: { label: "PM10", color: "#3b82f6", unit: "\u00b5g/m\u00b3" },
  voc: { label: "VOC", color: "#10b981", unit: "\u00b5g/m\u00b3" },
  no2: { label: "NO\u2082", color: "#f59e0b", unit: "\u00b5g/m\u00b3" },
  hcho: { label: "HCHO", color: "#ef4444", unit: "mg/m\u00b3" },
};

function AirQualityRing({
  level,
  temperature,
  humidity,
}: {
  level: AirQualityLevel;
  temperature: number;
  humidity: number;
}) {
  const color = AQ_COLORS[level];

  return (
    <div className="flex items-center gap-6">
      {/* AQI Ring */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-neutral-200 dark:text-neutral-700"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * 0.15}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center">
          <p
            className="text-lg font-bold"
            style={{ color }}
          >
            {AQ_LABEL[level]}
          </p>
        </div>
      </div>

      {/* Temperature & Humidity */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20">
            <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {Math.round(temperature)}°
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Temperature
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
            <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {Math.round(humidity)}%
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Humidity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PollutantGrid() {
  const { dysonAirPurifier: data } = useSmartDevices();

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {data.pollutants.map((p) => (
        <div
          key={p.shortLabel}
          className={`rounded-2xl p-3 text-center ${AQ_BG[p.level]}`}
        >
          <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
            {p.shortLabel}
          </p>
          <p className={`mt-1 text-xl font-bold ${AQ_TEXT[p.level]}`}>
            {p.value}
          </p>
          <p className="text-[9px] text-neutral-500 dark:text-neutral-400">
            {p.unit}
          </p>
        </div>
      ))}
    </div>
  );
}

function AirQualityChart() {
  const { dysonAirPurifier: data } = useSmartDevices();
  const [activeMetric, setActiveMetric] = useState<AqMetric>("pm25");

  const chartData = useMemo(() => {
    // Show last 24 hours
    return data.history.slice(-24);
  }, [data.history]);

  const config = METRIC_CONFIG[activeMetric];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-500" />
            Air Quality History
          </CardTitle>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last 24h
          </span>
        </div>
        {/* Metric Tabs */}
        <div className="flex flex-wrap gap-1 pt-1">
          {(Object.keys(METRIC_CONFIG) as AqMetric[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeMetric === key
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-500 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id={`gradient-${activeMetric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.4}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.4}
              axisLine={false}
              tickLine={false}
              width={35}
              label={{
                value: config.unit,
                angle: -90,
                position: "insideLeft",
                fontSize: 9,
                opacity: 0.4,
              }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number | undefined) => [
                `${v ?? 0} ${config.unit}`,
                config.label,
              ]}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#gradient-${activeMetric})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TemperatureHumidityChart() {
  const { dysonAirPurifier: data } = useSmartDevices();

  const chartData = useMemo(() => {
    return data.history.slice(-24);
  }, [data.history]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            Temperature & Humidity
          </CardTitle>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last 24h
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.4}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.4}
              axisLine={false}
              tickLine={false}
              width={30}
              domain={["auto", "auto"]}
              label={{
                value: "°C",
                angle: -90,
                position: "insideLeft",
                fontSize: 9,
                opacity: 0.4,
              }}
            />
            <YAxis
              yAxisId="humidity"
              orientation="right"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.4}
              axisLine={false}
              tickLine={false}
              width={30}
              domain={["auto", "auto"]}
              label={{
                value: "%",
                angle: 90,
                position: "insideRight",
                fontSize: 9,
                opacity: 0.4,
              }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number | undefined, name?: string) => [
                `${v ?? 0}${name === "temperature" ? "°C" : "%"}`,
                name === "temperature" ? "Temperature" : "Humidity",
              ]}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded bg-orange-500" />
            Temperature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded border-b border-dashed border-blue-500 bg-transparent" />
            Humidity
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterStatusCard() {
  const { dysonAirPurifier: data } = useSmartDevices();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wind className="h-4 w-4 text-purple-500" />
          Filter Life
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.filters.map((filter) => {
            const isLow = filter.remainingPercent <= 20;

            return (
              <div key={filter.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {filter.name}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isLow
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {filter.remainingPercent}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : "bg-gradient-to-r from-purple-500 to-purple-400"
                    }`}
                    style={{ width: `${filter.remainingPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    ~{filter.remainingMonths} month
                    {filter.remainingMonths !== 1 ? "s" : ""} remaining
                  </span>
                  {isLow && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Replace soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AirQualityReportCard() {
  const { dysonAirPurifier: data } = useSmartDevices();
  const { report } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-blue-500" />
          Indoor Air Quality Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend vs last month */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              vs. Last Month
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                report.comparedToLastMonth === "improved"
                  ? "text-green-600 dark:text-green-400"
                  : report.comparedToLastMonth === "deteriorated"
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {report.comparedToLastMonth === "improved" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : report.comparedToLastMonth === "deteriorated" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : null}
              {report.comparedToLastMonth.charAt(0).toUpperCase() +
                report.comparedToLastMonth.slice(1)}
            </span>
          </div>

          {/* Highest pollution */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Highest Pollution
            </span>
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {report.highestPollutionDate}
            </span>
          </div>

          {/* AQI Rating */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              AQI Rating
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${AQ_BG[report.aqiRating]} ${AQ_TEXT[report.aqiRating]}`}
            >
              {AQ_LABEL[report.aqiRating]}
            </span>
          </div>

          {/* Dominant Pollutant */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Dominant Pollutant
            </span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {report.dominantPollutant}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DysonAirPurifier() {
  const { dysonAirPurifier: data } = useSmartDevices();
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Wind className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {data.model}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Air Purifier &middot; {data.modelCode}
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

      {/* Air Quality Status + Pollutants */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100 to-emerald-50 p-6 dark:border-emerald-700/20 dark:from-emerald-900/25 dark:to-emerald-950/10">
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Current Air Quality
          </p>
          <AirQualityRing
            level={data.airQuality}
            temperature={data.currentTemperature}
            humidity={data.currentHumidity}
          />
        </div>
        <div className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-100 to-violet-50 p-6 dark:border-violet-700/20 dark:from-violet-900/25 dark:to-violet-950/10">
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Pollutant Levels
          </p>
          <PollutantGrid />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AirQualityChart />
        <TemperatureHumidityChart />
      </div>

      {/* Report + Filter Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AirQualityReportCard />
        <FilterStatusCard />
      </div>
    </div>
  );
}
