"use client";

import { useNodes } from "@/hooks/useDashboard";

export function ClusterTopology() {
  const { nodes } = useNodes();
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold tracking-tight text-neutral-950 dark:text-foreground">
        Cluster Topology
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-xl border border-[#e8e0d4] bg-white p-4 shadow-sm dark:border-white/12 dark:bg-[#1a1a1a]"
          >
            {/* Line 1: Status indicator and node name */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  node.status === "online"
                    ? "bg-green-500"
                    : node.status === "degraded"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                title={node.status}
              />
              <h4 className="text-sm font-semibold text-neutral-950 dark:text-foreground">
                {node.name}
              </h4>
            </div>

            {/* Line 2: IP address and uptime */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-600 dark:text-muted-foreground">
                {node.ip}
              </span>
              <span className="font-medium text-neutral-950 dark:text-foreground">
                {node.uptime}
              </span>
            </div>

            {/* Quick stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-muted-foreground">
                  CPU:
                </span>
                <span className="font-medium text-neutral-950 dark:text-foreground">
                  {node.cpu}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-muted-foreground">
                  RAM:
                </span>
                <span className="font-medium text-neutral-950 dark:text-foreground">
                  {node.memory}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
