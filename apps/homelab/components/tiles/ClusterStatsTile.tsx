import { Separator } from "@duyet/components/ui/separator";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/dither-kit/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useClusterStats,
  useDowntimeHistory,
  useResourceMetrics,
} from "@/hooks/useDashboard";

export function ClusterStatsTile() {
  const stats = useClusterStats();
  const { cpuHistory, memoryHistory } = useResourceMetrics();
  const downtimeHistory = useDowntimeHistory();

  const cpuData = cpuHistory.map((d) => d["minipc-01"] as number);
  const memData = memoryHistory.map((d) => d["minipc-01"] as number);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Cluster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <StatRow label="Avg CPU">
          <span className="font-mono text-lg font-semibold tabular-nums tracking-tight">
            {stats.avgCpu.toFixed(1)}
            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
              %
            </span>
          </span>
          <div className="h-[18px] w-14">
            <Sparkline data={cpuData} color="orange" />
          </div>
        </StatRow>
        <Separator />
        <StatRow label="Memory">
          <span className="font-mono text-lg font-semibold tabular-nums tracking-tight">
            {stats.usedMemory.toFixed(0)}
            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
              / {stats.totalMemory} GB
            </span>
          </span>
          <div className="h-[18px] w-14">
            <Sparkline data={memData} color="purple" />
          </div>
        </StatRow>
        <Separator />
        <StatRow label="Storage">
          <span className="font-mono text-lg font-semibold tabular-nums tracking-tight">
            {(stats.totalStorage / 1024).toFixed(1)}
            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
              TB
            </span>
          </span>
        </StatRow>
        <Separator />
        <StatRow label="Incidents">
          <span className="font-mono text-lg font-semibold tabular-nums tracking-tight">
            {downtimeHistory.length}
            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
              recent
            </span>
          </span>
        </StatRow>
      </CardContent>
    </Card>
  );
}

function StatRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
