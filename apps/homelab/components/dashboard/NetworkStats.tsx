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

const TOOLTIP_STYLE = {
  backgroundColor: "var(--rd-surface)",
  border: "1px solid var(--rd-border)",
  borderRadius: "8px",
  color: "var(--rd-text)",
  fontSize: "12px",
};

const formatTrafficValue = (value: number | string | readonly (number | string)[] | undefined) => {
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value);
  if (!Number.isFinite(numeric)) return "";
  if (numeric >= 1e9) return `${(numeric / 1e9).toFixed(2)} GB`;
  if (numeric >= 1e6) return `${(numeric / 1e6).toFixed(2)} MB`;
  if (numeric >= 1e3) return `${(numeric / 1e3).toFixed(2)} KB`;
  return `${numeric} B`;
};

export function NetworkStats() {
  const { speedTest, networkTraffic } = useNetworkStats();

  return (
    <div className="space-y-6">
      {/* Speedtest Results */}
      <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-[var(--rd-text)]">
          Internet Speed Test
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Download */}
          <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface)]">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-[var(--rd-ok)]" />
              <p className="text-xs font-medium text-[var(--rd-ok)]">
                Download
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.download}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">Mbps</p>
          </div>

          {/* Upload */}
          <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface)]">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-[var(--rd-accent)]" />
              <p className="text-xs font-medium text-[var(--rd-accent)]">
                Upload
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.upload}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">Mbps</p>
          </div>

          {/* Ping */}
          <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface)]">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--rd-text-3)]" />
              <p className="text-xs font-medium text-[var(--rd-text-3)]">
                Ping
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {speedTest.ping}
            </p>
            <p className="mt-1 text-sm text-[var(--rd-text-3)]">ms</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--rd-text-3)]">
          Last test: {speedTest.timestamp} (via speedtest-cli)
        </p>
      </div>

      {/* Network Traffic Chart */}
      <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-[var(--rd-text)]">
          Network Traffic - Last 24 Hours
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={networkTraffic}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTrafficValue} />
            <Line
              type="monotone"
              dataKey="in"
              stroke="var(--rd-accent)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="out"
              stroke="var(--rd-text-3)"
              strokeWidth={2}
              dot={false}
              opacity={0.6}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-sky" />
            <span className="text-[var(--rd-text-3)]">Incoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-claude-coral" />
            <span className="text-[var(--rd-text-3)]">Outgoing</span>
          </div>
        </div>
      </div>
    </div>
  );
}