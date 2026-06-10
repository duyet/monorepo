"use client";

import {
  Activity,
  CheckCircle2,
  Database,
  HardDrive,
  Server,
} from "lucide-react";
import { useClusterStats } from "@/hooks/useDashboard";

const STAT_CARDS = [
  {
    key: "nodes",
    icon: Server,
    iconColor: "var(--rd-accent)",
    label: "Total Nodes",
    value: (stats: ReturnType<typeof useClusterStats>) => stats.totalNodes,
    subValue: (stats: ReturnType<typeof useClusterStats>) => `${stats.onlineNodes} online`,
    subColor: "var(--rd-ok)",
  },
  {
    key: "services",
    icon: CheckCircle2,
    iconColor: "var(--rd-ok)",
    label: "Services",
    value: (stats: ReturnType<typeof useClusterStats>) => stats.totalServices,
    subValue: (stats: ReturnType<typeof useClusterStats>) => `${stats.runningServices} running`,
    subColor: "var(--rd-ok)",
  },
  {
    key: "cpu",
    icon: Activity,
    iconColor: "var(--rd-accent)",
    label: "Avg CPU",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.avgCpu.toFixed(1)}%`,
    subValue: () => "Across all nodes",
    subColor: "var(--rd-text-3)",
  },
  {
    key: "memory",
    icon: HardDrive,
    iconColor: "var(--rd-warn)",
    label: "Memory",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.usedMemory.toFixed(0)} GB`,
    subValue: (stats: ReturnType<typeof useClusterStats>) => `/ ${stats.totalMemory} GB · ${stats.avgMemory.toFixed(1)}% used`,
    subColor: "var(--rd-text-3)",
  },
  {
    key: "storage",
    icon: Database,
    iconColor: "var(--rd-text-3)",
    label: "Storage",
    value: (stats: ReturnType<typeof useClusterStats>) => `${(stats.totalStorage / 1024).toFixed(1)} TB`,
    subValue: () => "Total capacity",
    subColor: "var(--rd-text-3)",
  },
];

export function ClusterOverview() {
  const stats = useClusterStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STAT_CARDS.map((card) => (
        <div
          key={card.key}
          className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)] hover:bg-[var(--rd-surface)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--rd-text-3)]" style={{ color: card.iconColor }}>
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
                {card.value(stats)}
              </p>
              <p className="mt-1 text-xs" style={{ color: card.subColor }}>
                {card.subValue(stats)}
              </p>
            </div>
            <card.icon className="h-9 w-9" style={{ color: card.iconColor }} />
          </div>
        </div>
      ))}
    </div>
  );
}