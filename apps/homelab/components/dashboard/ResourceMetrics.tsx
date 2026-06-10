"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useResourceMetrics } from "@/hooks/useDashboard";
import { CHART_COLORS } from "@/lib/constants";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--rd-surface)",
  border: "1px solid var(--rd-border)",
  borderRadius: "8px",
  color: "var(--rd-text)",
  fontSize: "12px",
};

const AXIS_STYLE = {
  tick: { fontSize: 12 },
  stroke: "currentColor",
  opacity: 0.5,
};

export function ResourceMetrics() {
  const { cpuHistory, memoryHistory } = useResourceMetrics();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* CPU Usage */}
      <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-[var(--rd-text)]">
          CPU Usage - Last 24 Hours
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={cpuHistory}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" {...AXIS_STYLE} />
            <YAxis
              {...AXIS_STYLE}
              domain={[0, 100]}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="minipc-01"
              stroke={CHART_COLORS.CLAUDE_LAVENDER}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minipc-02"
              stroke={CHART_COLORS.CLAUDE_MINT}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minipc-03"
              stroke={CHART_COLORS.CLAUDE_SUNSHINE}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-lavender" />
            <span className="text-[var(--rd-text-3)]">minipc-01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-mint" />
            <span className="text-[var(--rd-text-3)]">minipc-02</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-yellow" />
            <span className="text-[var(--rd-text-3)]">minipc-03</span>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-[var(--rd-text)]">
          Memory Usage - Last 24 Hours
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={memoryHistory}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" {...AXIS_STYLE} />
            <YAxis
              {...AXIS_STYLE}
              domain={[0, 100]}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="minipc-01"
              stroke={CHART_COLORS.CLAUDE_LAVENDER}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minipc-02"
              stroke={CHART_COLORS.CLAUDE_MINT}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minipc-03"
              stroke={CHART_COLORS.CLAUDE_SUNSHINE}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-lavender" />
            <span className="text-[var(--rd-text-3)]">minipc-01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-mint" />
            <span className="text-[var(--rd-text-3)]">minipc-02</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-claude-yellow" />
            <span className="text-[var(--rd-text-3)]">minipc-03</span>
          </div>
        </div>
      </div>
    </div>
  );
}