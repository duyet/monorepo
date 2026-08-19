"use client";

import { Line } from "@/components/dither-kit/area";
import { LineChart } from "@/components/dither-kit/area-chart";
import { Grid } from "@/components/dither-kit/grid";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceMetrics } from "@/hooks/useDashboard";
import { NODE_CHART_CONFIG, NODE_CHART_KEYS } from "@/lib/chart";
import { BlockLegend } from "@/components/dither-kit/block-legend";

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
        <BlockLegend config={NODE_CHART_CONFIG} align="end" className="text-[11px]" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full min-w-0">
          <LineChart data={data} config={NODE_CHART_CONFIG} bloom="aura">
            <Grid />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={(v) => `${v}`} />
            <Tooltip labelKey="time" valueFormatter={(v) => `${v}%`} />
            {NODE_CHART_KEYS.map((key) => (
              <Line key={key} dataKey={key} />
            ))}
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
}
