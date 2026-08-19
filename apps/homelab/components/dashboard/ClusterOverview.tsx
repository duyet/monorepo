"use client";

import { Activity, Database, HardDrive, Server, CheckCircle2 } from "lucide-react";
import { useClusterStats } from "@/hooks/useDashboard";
import { Card, CardContent } from "@/components/ui/card";

const STAT_CARDS = [
  {
    key: "nodes",
    icon: Server,
    label: "Nodes",
    value: (stats: ReturnType<typeof useClusterStats>) => String(stats.totalNodes),
    sub: (stats: ReturnType<typeof useClusterStats>) => `${stats.onlineNodes} online`,
  },
  {
    key: "services",
    icon: CheckCircle2,
    label: "Services",
    value: (stats: ReturnType<typeof useClusterStats>) => String(stats.totalServices),
    sub: (stats: ReturnType<typeof useClusterStats>) => `${stats.runningServices} running`,
  },
  {
    key: "cpu",
    icon: Activity,
    label: "Avg CPU",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.avgCpu.toFixed(1)}%`,
    sub: () => "all nodes",
  },
  {
    key: "memory",
    icon: HardDrive,
    label: "Memory",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.usedMemory.toFixed(0)} GB`,
    sub: (stats: ReturnType<typeof useClusterStats>) =>
      `/ ${stats.totalMemory} GB · ${stats.avgMemory.toFixed(1)}%`,
  },
  {
    key: "storage",
    icon: Database,
    label: "Storage",
    value: (stats: ReturnType<typeof useClusterStats>) =>
      `${(stats.totalStorage / 1024).toFixed(1)} TB`,
    sub: () => "capacity",
  },
];

export function ClusterOverview() {
  const stats = useClusterStats();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((card) => (
        <Card key={card.key} className="min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <card.icon className="size-3.5" />
              <p className="text-[11px] font-medium">{card.label}</p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {card.value(stats)}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {card.sub(stats)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
