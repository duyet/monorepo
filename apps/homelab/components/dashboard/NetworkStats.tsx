"use client";

import { ArrowDown, ArrowUp, Gauge } from "lucide-react";
import type { ReactNode } from "react";
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
import { chartTick, chartTooltipStyle } from "@/lib/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@duyet/components/ui/separator";

const formatTrafficValue = (
  value: number | string | readonly (number | string)[] | undefined,
) => {
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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Card className="min-w-0 lg:col-span-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Speed test</CardTitle>
        </CardHeader>
        <CardContent>
          <SpeedRow
            icon={<ArrowDown className="size-3.5 text-[var(--rd-ok)]" />}
            label="Download"
            value={speedTest.download}
            unit="Mbps"
          />
          <Separator />
          <SpeedRow
            icon={<ArrowUp className="size-3.5 text-[var(--rd-accent)]" />}
            label="Upload"
            value={speedTest.upload}
            unit="Mbps"
          />
          <Separator />
          <SpeedRow
            icon={<Gauge className="size-3.5 text-muted-foreground" />}
            label="Ping"
            value={speedTest.ping}
            unit="ms"
          />
          <p className="mt-3 text-[11px] text-muted-foreground">
            {speedTest.timestamp} · speedtest-cli
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 lg:col-span-8">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Traffic · 24h</CardTitle>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--rd-accent)]" />
              In
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" />
              Out
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={networkTraffic}
                margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={chartTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={formatTrafficValue}
                />
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
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  dot={false}
                  opacity={0.6}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SpeedRow({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-mono text-xl font-semibold tabular-nums tracking-tight">
        {value}
        <span className="ml-1 text-[11px] font-normal text-muted-foreground">
          {unit}
        </span>
      </span>
    </div>
  );
}
