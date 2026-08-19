"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Area, Line } from "@/components/dither-kit/area";
import { AreaChart, LineChart } from "@/components/dither-kit/area-chart";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Grid } from "@/components/dither-kit/grid";
import type { DitherColor } from "@/components/dither-kit/palette";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BENTO_CELL } from "@/lib/constants";
import type { AirQualityLevel } from "@/lib/data";

const AQ_COLORS: Record<AirQualityLevel, string> = {
  good: "#8fd4ab",
  fair: "#f5cc70",
  moderate: "#ffc9a0",
  poor: "#ff8585",
  "very-poor": "#ff8585",
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
  moderate: "text-claude-peach",
  poor: "text-claude-coral",
  "very-poor": "text-claude-coral",
};

const AQ_LABEL: Record<AirQualityLevel, string> = {
  good: "Good",
  fair: "Fair",
  moderate: "Moderate",
  poor: "Poor",
  "very-poor": "Very Poor",
};

const STATUS_CONFIG = {
  online: {
    label: "Running",
    badgeClass: "bg-claude-mint/20 text-claude-mint dark:bg-claude-mint/10",
    dotClass: "bg-claude-mint",
  },
  idle: {
    label: "Standby",
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

type AqMetric = "pm25" | "pm10" | "voc" | "no2" | "hcho";

const METRIC_CONFIG: Record<
  AqMetric,
  { label: string; color: DitherColor; unit: string }
> = {
  pm25: { label: "PM2.5", color: "purple", unit: "\u00b5g/m\u00b3" },
  pm10: { label: "PM10", color: "blue", unit: "\u00b5g/m\u00b3" },
  voc: { label: "VOC", color: "green", unit: "\u00b5g/m\u00b3" },
  no2: { label: "NO\u2082", color: "orange", unit: "\u00b5g/m\u00b3" },
  hcho: { label: "HCHO", color: "red", unit: "mg/m\u00b3" },
};

const TEMP_HUMIDITY_CONFIG: ChartConfig = {
  temperature: { label: "Temperature", color: "orange" },
  humidity: { label: "Humidity", color: "blue" },
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
          <p className="text-lg font-bold" style={{ color }}>
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
          className={`rounded-md p-2.5 text-center ${AQ_BG[p.level]}`}
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
    return data.history.slice(-24);
  }, [data.history]);

  const config = METRIC_CONFIG[activeMetric];

  return (
    <div className={`${BENTO_CELL} md:col-span-2 lg:col-span-2`}>
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <Gauge className="h-4 w-4 text-claude-lavender" />
            Air Quality History
          </h4>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last 24h
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(METRIC_CONFIG) as AqMetric[]).map((key) => (
            <button
              type="button"
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
      </div>
      <div className="h-[200px] w-full min-w-0">
        <AreaChart
          data={chartData}
          config={{ [activeMetric]: { label: config.label, color: config.color } }}
          bloom="aura"
        >
          <Grid />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            labelKey="time"
            valueFormatter={(v) => `${v} ${config.unit}`}
          />
          <Area dataKey={activeMetric} variant="gradient" />
        </AreaChart>
      </div>
    </div>
  );
}

function TemperatureHumidityChart() {
  const { dysonAirPurifier: data } = useSmartDevices();

  const chartData = useMemo(() => {
    return data.history.slice(-24);
  }, [data.history]);

  return (
    <div className={`${BENTO_CELL} md:col-span-2 lg:col-span-2`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <Thermometer className="h-4 w-4 text-claude-orange" />
            Temperature & Humidity
          </h4>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last 24h
          </span>
        </div>
      </div>
      <div className="h-[200px] w-full min-w-0">
        <LineChart data={chartData} config={TEMP_HUMIDITY_CONFIG} bloom="aura">
          <Grid />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            labelKey="time"
            valueFormatter={(v, name) =>
              name === "temperature" ? `${v}°C` : `${v}%`
            }
          />
          <Line dataKey="temperature" />
          <Line dataKey="humidity" strokeVariant="dashed" />
        </LineChart>
      </div>
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
    </div>
  );
}

function FilterStatus() {
  const { dysonAirPurifier: data } = useSmartDevices();

  return (
    <div className={BENTO_CELL}>
      <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        <Wind className="h-4 w-4 text-claude-lavender" />
        Filter Life
      </h4>
      <div className="space-y-3">
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
              <div className="h-3 w-full overflow-hidden rounded-full bg-claude-tan/50 dark:bg-neutral-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLow ? "bg-claude-coral" : "bg-claude-lavender"
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
    </div>
  );
}

function ReportRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function AirQualityReport() {
  const { dysonAirPurifier: data } = useSmartDevices();
  const { report } = data;

  return (
    <div className={BENTO_CELL}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Gauge className="h-4 w-4 text-claude-sky" />
        Indoor air quality
      </h4>
      <div className="divide-y divide-border">
        <ReportRow label="vs last month">
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              report.comparedToLastMonth === "improved"
                ? "text-claude-mint"
                : report.comparedToLastMonth === "deteriorated"
                  ? "text-claude-coral"
                  : "text-muted-foreground"
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
        </ReportRow>
        <ReportRow label="Highest pollution">
          <span className="text-xs font-medium">{report.highestPollutionDate}</span>
        </ReportRow>
        <ReportRow label="AQI">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${AQ_BG[report.aqiRating]} ${AQ_TEXT[report.aqiRating]}`}
          >
            {AQ_LABEL[report.aqiRating]}
          </span>
        </ReportRow>
        <ReportRow label="Dominant">
          <span className="text-xs font-medium">{report.dominantPollutant}</span>
        </ReportRow>
      </div>
    </div>
  );
}

export function DysonAirPurifier() {
  const { dysonAirPurifier: data } = useSmartDevices();
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div className="space-y-3">
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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Air Quality Status */}
        <div className={BENTO_CELL}>
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Current Air Quality
          </p>
          <AirQualityRing
            level={data.airQuality}
            temperature={data.currentTemperature}
            humidity={data.currentHumidity}
          />
        </div>

        {/* Pollutant Levels */}
        <div className={`${BENTO_CELL} lg:col-span-2`}>
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Pollutant Levels
          </p>
          <PollutantGrid />
        </div>

        {/* Air Quality History Chart — spans 2 cols */}
        <AirQualityChart />

        {/* Indoor Air Quality Report — 1 col */}
        <AirQualityReport />

        {/* Filter Life — 1 col */}
        <FilterStatus />

        {/* Temperature & Humidity Chart — spans 2 cols */}
        <TemperatureHumidityChart />
      </div>
    </div>
  );
}
