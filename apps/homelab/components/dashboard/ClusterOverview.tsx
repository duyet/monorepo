"use client";

import { useClusterStats } from "@/hooks/useDashboard";

const statCards = [
  {
    key: "nodes",
    label: "Nodes",
    value: (stats: ReturnType<typeof useClusterStats>) => String(stats.totalNodes),
    sub: (stats: ReturnType<typeof useClusterStats>) => `${stats.onlineNodes} online`,
  },
  {
    key: "services",
    label: "Services",
    value: (stats: ReturnType<typeof useClusterStats>) => String(stats.totalServices),
    sub: (stats: ReturnType<typeof useClusterStats>) => `${stats.runningServices} running`,
  },
  {
    key: "cpu",
    label: "Avg CPU",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.avgCpu.toFixed(1)}%`,
    sub: () => "all nodes",
  },
  {
    key: "memory",
    label: "Memory",
    value: (stats: ReturnType<typeof useClusterStats>) => `${stats.usedMemory.toFixed(0)} GB`,
    sub: (stats: ReturnType<typeof useClusterStats>) =>
      `/ ${stats.totalMemory} GB · ${stats.avgMemory.toFixed(1)}%`,
  },
  {
    key: "storage",
    label: "Storage",
    value: (stats: ReturnType<typeof useClusterStats>) =>
      `${(stats.totalStorage / 1024).toFixed(1)} TB`,
    sub: () => "capacity",
  },
];

export function ClusterOverview() {
  const stats = useClusterStats();

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--rd-border)] bg-[var(--rd-border)] sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => (
        <div key={card.key} className="min-w-0 bg-[var(--rd-surface)] p-5">
          <p className="text-[12px] text-[var(--rd-text-3)]">{card.label}</p>
          <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[var(--rd-text)]">
            {card.value(stats)}
          </p>
          <p className="mt-2 truncate font-mono text-[12px] text-[var(--rd-text-3)]">
            {card.sub(stats)}
          </p>
        </div>
      ))}
    </div>
  );
}
