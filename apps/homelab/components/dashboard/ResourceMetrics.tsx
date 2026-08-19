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
import {
  chartTick,
  chartTooltipStyle,
  NODE_CHART_COLORS,
  NODE_CHART_KEYS,
} from "@/lib/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResourceMetrics() {
  const { cpuHistory, memoryHistory } = useResourceMetrics();

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <MetricChart title="CPU · 24h" data={cpuHistory} />
      <MetricChart title="Memory · 24h" data={memoryHistory} />
    </div>
  );
}

function MetricChart({
  title,
  data,
}: {
  title: string;
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Legend />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={chartTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={chartTick}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              {NODE_CHART_KEYS.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={NODE_CHART_COLORS[key]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {NODE_CHART_KEYS.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: NODE_CHART_COLORS[key] }}
          />
          {key}
        </span>
      ))}
    </div>
  );
}
