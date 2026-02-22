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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceMetrics } from "@/hooks/useDashboard";
import { CHART_COLORS } from "@/lib/constants";

export function ResourceMetrics() {
  const { cpuHistory, memoryHistory } = useResourceMetrics();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* CPU Usage */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage - Last 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cpuHistory}>
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
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="minipc-01"
                stroke={CHART_COLORS.CLAUDE_LAVENDER}
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="minipc-02"
                stroke={CHART_COLORS.CLAUDE_MINT}
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="minipc-03"
                stroke={CHART_COLORS.CLAUDE_SUNSHINE}
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-lavender" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-01
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-mint" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-02
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-yellow" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-03
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage - Last 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={memoryHistory}>
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
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="minipc-01"
                stroke={CHART_COLORS.CLAUDE_LAVENDER}
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="minipc-02"
                stroke={CHART_COLORS.CLAUDE_MINT}
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="minipc-03"
                stroke={CHART_COLORS.CLAUDE_SUNSHINE}
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-lavender" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-01
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-mint" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-02
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-claude-yellow" />
              <span className="text-neutral-600 dark:text-neutral-400">
                minipc-03
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
