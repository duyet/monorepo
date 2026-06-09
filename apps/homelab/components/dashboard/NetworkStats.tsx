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
        <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--rd-text)]">
          Internet Speed Test
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Download */}
          <div className="rd-card p-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-[var(--rd-ok)]" />
              <p className="text-xs font-medium text-[var(--rd-ok)]">
                Download
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.download}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">
              Mbps
            </p>
          </div>

          {/* Upload */}
          <div className="rd-card p-4">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-[var(--rd-accent)]" />
              <p className="text-xs font-medium text-[var(--rd-accent)]">
                Upload
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.upload}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">
              Mbps
            </p>
          </div>

          {/* Ping */}
          <div className="rd-card p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--rd-text-3)]" />
              <p className="text-xs font-medium text-[var(--rd-text-3)]">
                Ping
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.ping}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">
              ms
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--rd-text-3)]">
          Last test: {speedTest.timestamp} (via speedtest-cli)
        </p>
      </div>

      {/* Network Traffic Chart */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--rd-text)]">
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
                backgroundColor: "var(--rd-surface)",
                border: "1px solid var(--rd-border)",
                borderRadius: "8px",
                color: "var(--rd-text)",
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
            <span className="text-[var(--rd-text-3)]">
              Incoming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-coral" />
            <span className="text-[var(--rd-text-3)]">
              Outgoing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
