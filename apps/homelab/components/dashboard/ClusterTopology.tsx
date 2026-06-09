"use client";

import { useNodes } from "@/hooks/useDashboard";

export function ClusterTopology() {
  const { nodes } = useNodes();
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--rd-text)]">
        Cluster Topology
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rd-card p-4"
          >
            {/* Line 1: Status indicator and node name */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  node.status === "online"
                    ? "bg-[var(--rd-ok)]"
                    : node.status === "degraded"
                      ? "bg-[var(--rd-warn)]"
                      : "bg-[var(--rd-down)]"
                }`}
                title={node.status}
              />
              <h4 className="text-sm font-semibold text-[var(--rd-text)]">
                {node.name}
              </h4>
            </div>

            {/* Line 2: IP address and uptime */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]">
                {node.ip}
              </span>
              <span className="font-medium text-[var(--rd-text)]">
                {node.uptime}
              </span>
            </div>

            {/* Quick stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--rd-text-3)]">
                  CPU:
                </span>
                <span className="font-medium text-[var(--rd-text)]">
                  {node.cpu}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--rd-text-3)]">
                  RAM:
                </span>
                <span className="font-medium text-[var(--rd-text)]">
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
