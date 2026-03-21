"use client";

import { ArrowDown, ArrowUp, Gauge } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNetworkStats } from "@/hooks/useDashboard";

export function NetworkStats() {
  const { networkTraffic, speedTest } = useNetworkStats();
  return (
    <div className="space-y-6">
      {/* Speedtest Results */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Internet Speed Test
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Download — emerald */}
          <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 dark:border-emerald-700/20 dark:from-emerald-900/25 dark:to-emerald-950/10">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Download
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.download}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Mbps
            </p>
          </div>

          {/* Upload — red */}
          <div className="rounded-3xl border border-red-200/70 bg-gradient-to-br from-red-100 to-red-50 p-4 dark:border-red-700/20 dark:from-red-900/25 dark:to-red-950/10">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                Upload
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.upload}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Mbps
            </p>
          </div>

          {/* Ping — violet */}
          <div className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-100 to-violet-50 p-4 dark:border-violet-700/20 dark:from-violet-900/25 dark:to-violet-950/10">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Ping
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.ping}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              ms
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
          Last test: {speedTest.timestamp} (via speedtest-cli)
        </p>
      </div>

      {/* Network Traffic Chart */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Network Traffic - Last 24 Hours
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={networkTraffic}>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="time"
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
                value: "MB/s",
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) => `${value ?? 0} MB/s`}
            />
            <Line
              type="monotone"
              dataKey="in"
              stroke="#90c8ff"
              strokeWidth={2}
              dot={false}
              name="Incoming"
            />
            <Line
              type="monotone"
              dataKey="out"
              stroke="#ff8585"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
              name="Outgoing"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-sky" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Incoming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-coral" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Outgoing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
