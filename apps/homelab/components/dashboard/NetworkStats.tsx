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

function formatTrafficValue(
  value: number | string | readonly (number | string)[] | undefined
) {
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value);
  return `${Number.isFinite(numeric) ? numeric : 0} MB/s`;
}

export function NetworkStats() {
  const { networkTraffic, speedTest } = useNetworkStats();
  return (
    <div className="space-y-6">
      {/* Speedtest Results */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-neutral-950 dark:text-foreground">
          Internet Speed Test
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Download — emerald */}
          <div className="rounded-xl border border-[#d9ead0] bg-[#eef8e8] p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Download
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {speedTest.download}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-muted-foreground">
              Mbps
            </p>
          </div>

          {/* Upload — red */}
          <div className="rounded-xl border border-[#f0d8c5] bg-[#fff1e4] p-4 dark:border-red-900/40 dark:bg-red-950/30">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                Upload
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {speedTest.upload}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-muted-foreground">
              Mbps
            </p>
          </div>

          {/* Ping — violet */}
          <div className="rounded-xl border border-[#dddafe] bg-[#f3f2ff] p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-600 dark:text-violet-600" />
              <p className="text-xs font-medium text-violet-700 dark:text-violet-700">
                Ping
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {speedTest.ping}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-muted-foreground">
              ms
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-600 dark:text-muted-foreground">
          Last test: {speedTest.timestamp} (via speedtest-cli)
        </p>
      </div>

      {/* Network Traffic Chart */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-neutral-950 dark:text-foreground">
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
              formatter={(value) => formatTrafficValue(value)}
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
            <span className="text-neutral-600 dark:text-muted-foreground">
              Incoming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-coral" />
            <span className="text-neutral-600 dark:text-muted-foreground">
              Outgoing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
