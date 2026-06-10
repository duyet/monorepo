import { Sparkline } from "@duyet/components";
import { useNodes, useResourceMetrics } from "@/hooks/useDashboard";
import { StatusDot } from "./StatusDot";

function NodesTile() {
  const { nodes, onlineCount, totalNodes } = useNodes();
  const { cpuHistory } = useResourceMetrics();

  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] md:col-span-2">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">Nodes</span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {onlineCount}/{totalNodes} online
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {nodes.map((node) => {
          const isOffline = node.status !== "online";

          // Extract last 13 CPU data points for this node from cpuHistory
          const nodeCpuData = cpuHistory
            .slice(-13)
            .map((entry) => entry[node.name as keyof typeof entry])
            .filter((v): v is number => typeof v === "number");

          return (
            <div
              key={node.id}
              className={`p-3 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)] transition-colors ${isOffline ? "opacity-50" : "hover:bg-[var(--rd-surface)]"}`}
            >
              {/* Row 1: status + name + type chip */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <StatusDot status={node.status} />
                <span className="font-[var(--font-mono)] text-sm font-semibold text-[var(--rd-text)] truncate">
                  {node.name}
                </span>
                <span className="rd-chip font-[var(--font-mono)] text-[10px] ml-auto shrink-0">
                  {node.type}
                </span>
              </div>

              {/* Row 2: CPU% / RAM% */}
              <div className="font-[var(--font-mono)] text-xs text-[var(--rd-text-3)] mb-1.5">
                CPU {node.cpu}% &middot; RAM {node.memory}%
              </div>

              {/* Row 3: sparkline or offline */}
              {isOffline ? (
                <div className="text-[var(--rd-text-3)] text-[10px] font-[var(--font-mono)] mb-1">
                  offline
                </div>
              ) : (
                <Sparkline
                  data={nodeCpuData}
                  h={16}
                  stroke="var(--rd-accent)"
                  fill={true}
                />
              )}

              {/* Row 4: IP */}
              <div className="text-[var(--rd-text-3)] text-[10px] font-[var(--font-mono)]">
                {node.ip}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { NodesTile };