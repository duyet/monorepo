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
  good: "#8fd4ab",
  fair: "#f5cc70",
  moderate: "#D97757",
  poor: "#ff8585",
  "very-poor": "#CC785C",
};

const AQ_BG: Record<AirQualityLevel, string> = {
  good: "bg-claude-mint/20 dark:bg-claude-mint/10",
  fair: "bg-claude-yellow/25 dark:bg-claude-yellow/10",
  moderate: "bg-claude-peach/30 dark:bg-claude-peach/10",
  poor: "bg-claude-coral/20 dark:bg-claude-coral/10",
  "very-poor": "bg-claude-coral/30 dark:bg-claude-coral/15",
};

const AQ_TEXT: Record<AirQualityLevel, string> = {
  good: "text-claude-mint",
  fair: "text-claude-yellow",
  moderate: "text-claude-orange",
  poor: "text-claude-coral",
  "very-poor": "text-claude-copper",
};

const AQ_LABEL: Record<AirQualityLevel, string> = {
  good: "Good",
  fair: "Fair",
  moderate: "Moderate",
  poor: "Poor",
  "very-poor": "Very Poor",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FBF7F0",
  border: "1px solid #E6D9C9",
  borderRadius: "8px",
  fontSize: "12px",
};

const STATUS_CONFIG = {
  online: {
    label: "Running",
    badgeClass:
      "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
    dotClass: "bg-claude-mint",
  },
  idle: {
    label: "Standby",
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

type AqMetric = "pm25" | "pm10" | "voc" | "no2" | "hcho";

const METRIC_CONFIG: Record<
  AqMetric,
  { label: string; color: string; unit: string }
> = {
  pm25: { label: "PM2.5", color: "#b8b5ff", unit: "\u00b5g/m\u00b3" },
  pm10: { label: "PM10", color: "#90c8ff", unit: "\u00b5g/m\u00b3" },
  voc: { label: "VOC", color: "#8fd4ab", unit: "\u00b5g/m\u00b3" },
  no2: { label: "NO\u2082", color: "#f5cc70", unit: "\u00b5g/m\u00b3" },
  hcho: { label: "HCHO", color: "#ff8585", unit: "mg/m\u00b3" },
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
            className="text-claude-tan dark:text-neutral-700"
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-claude-peach/30 dark:bg-claude-peach/10">
            <Thermometer className="h-4 w-4 text-claude-orange" />
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-claude-sky/30 dark:bg-claude-sky/10">
            <Droplets className="h-4 w-4 text-claude-sky" />
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
            <Gauge className="h-4 w-4 text-claude-lavender" />
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
            <Thermometer className="h-4 w-4 text-claude-orange" />
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
              stroke="#D97757"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="#90c8ff"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded bg-claude-orange" />
            Temperature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded border-b border-dashed border-claude-sky bg-transparent" />
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
          <Wind className="h-4 w-4 text-claude-lavender" />
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
                        ? "text-claude-coral"
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
                        ? "bg-claude-coral"
                        : "bg-claude-lavender"
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
                    <span className="flex items-center gap-1 text-claude-coral">
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
          <Gauge className="h-4 w-4 text-claude-sky" />
          Indoor Air Quality Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend vs last month */}
          <div className="flex items-center justify-between rounded-xl bg-claude-cream p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              vs. Last Month
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                report.comparedToLastMonth === "improved"
                  ? "text-claude-mint"
                  : report.comparedToLastMonth === "deteriorated"
                    ? "text-claude-coral"
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
          <div className="flex items-center justify-between rounded-xl bg-claude-cream p-3 dark:bg-neutral-800/50">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Highest Pollution
            </span>
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {report.highestPollutionDate}
            </span>
          </div>

          {/* AQI Rating */}
          <div className="flex items-center justify-between rounded-xl bg-claude-cream p-3 dark:bg-neutral-800/50">
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
          <div className="flex items-center justify-between rounded-xl bg-claude-cream p-3 dark:bg-neutral-800/50">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-claude-lavender/25 dark:bg-claude-lavender/10">
          <Wind className="h-5 w-5 text-claude-lavender" />
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
        <div className="rounded-3xl border border-claude-mint/30 bg-gradient-to-br from-claude-mint/25 to-claude-mint/5 p-6 dark:border-claude-mint/10 dark:from-claude-mint/10 dark:to-claude-mint/5">
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Current Air Quality
          </p>
          <AirQualityRing
            level={data.airQuality}
            temperature={data.currentTemperature}
            humidity={data.currentHumidity}
          />
        </div>
        <div className="rounded-3xl border border-claude-lavender/30 bg-gradient-to-br from-claude-lavender/25 to-claude-lavender/5 p-6 dark:border-claude-lavender/10 dark:from-claude-lavender/10 dark:to-claude-lavender/5">
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
