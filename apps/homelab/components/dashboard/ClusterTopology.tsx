"use client";

import { useNodes } from "@/hooks/useDashboard";
import { useClusterInfo } from "@/hooks/useDashboard";

export function ClusterTopology() {
  const { nodes } = useNodes();
  const clusterInfo = useClusterInfo();

  return (
    <div className="space-y-6">
      {/* k3s Cluster Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="rd-eyebrow">Kubernetes</span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--rd-text)]">
            Cluster Topology
          </h2>
          <p className="mt-1 text-sm text-[var(--rd-text-3)]">
            {clusterInfo.platform} {clusterInfo.version} · {clusterInfo.cni} CNI · {clusterInfo.csi} CSI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rd-chip inline-flex items-center gap-1.5">
            <span
              className="inline-block w-[7px] h-[7px] rounded-full"
              style={{ background: "var(--rd-ok)" }}
            />
            k3s
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => {
          const role = clusterInfo.nodeRoles[node.name] ?? "worker";
          const isOffline = node.status !== "online";

          return (
            <div
              key={node.id}
              className={`p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)] transition-colors ${
                isOffline ? "opacity-50" : "hover:bg-[var(--rd-surface)]"
              }`}
            >
              {/* Line 1: Status indicator, node name, role */}
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
                <span className="rd-chip font-[var(--font-mono)] text-[10px] ml-auto shrink-0">
                  {role}
                </span>
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
                  <span className="text-[var(--rd-text-3)]">CPU:</span>
                  <span className="font-medium text-[var(--rd-text)]">
                    {node.cpu}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--rd-text-3)]">RAM:</span>
                  <span className="font-medium text-[var(--rd-text)]">
                    {node.memory}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--rd-text-3)]">Services:</span>
                  <span className="font-medium text-[var(--rd-text)]">
                    {node.services}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}