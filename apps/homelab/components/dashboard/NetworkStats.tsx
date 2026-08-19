"use client";

import { Separator } from "@duyet/components/ui/separator";
import { ArrowDown, ArrowUp, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { Line } from "@/components/dither-kit/area";
import { LineChart } from "@/components/dither-kit/area-chart";
import { BlockLegend } from "@/components/dither-kit/block-legend";
import { Grid } from "@/components/dither-kit/grid";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetworkStats } from "@/hooks/useDashboard";
import { TRAFFIC_CHART_CONFIG } from "@/lib/chart";

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
          <BlockLegend config={TRAFFIC_CHART_CONFIG} align="end" className="text-[11px]" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full min-w-0">
            <LineChart data={networkTraffic} config={TRAFFIC_CHART_CONFIG} bloom="aura">
              <Grid />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip labelKey="time" />
              <Line dataKey="in" />
              <Line dataKey="out" strokeVariant="dashed" />
            </LineChart>
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
