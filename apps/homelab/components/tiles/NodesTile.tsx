import { Server } from "lucide-react";
import type { Node } from "@/lib/data/types";
import { StatusDot } from "./StatusDot";
import { MeterBar } from "./MeterBar";

function NodesTile({
  nodes,
  onlineCount,
  totalNodes,
  typeLabels,
}: {
  nodes: Node[];
  onlineCount: number;
  totalNodes: number;
  typeLabels: Record<string, string>;
}) {
  return (
    <div
      className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12"
      data-md-col="span 5"
    >
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <Server size={13} />
          Nodes
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {onlineCount}/{totalNodes} online
        </span>
      </div>

      {/* Node chip strip */}
      <div className="flex flex-wrap gap-[6px] mb-[18px]">
        {nodes.map((node) => (
          <span
            key={node.id}
            className="rd-chip font-[var(--font-mono)] text-[10.5px] gap-[5px]"
            style={{ opacity: node.status === "offline" ? 0.5 : 1 }}
          >
            <StatusDot status={node.status} />
            {node.name}
          </span>
        ))}
      </div>

      {/* Per-node rows */}
      <div className="rd-rows border-t border-[var(--rd-line)]">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="grid grid-cols-[1fr_auto] gap-3 py-[14px] border-b border-[var(--rd-line)]"
          >
            {/* Left: name + meta */}
            <div>
              <div className="flex items-center gap-2 mb-[6px]">
                <StatusDot status={node.status} />
                <span className="font-[var(--font-mono)] font-semibold text-[13.5px]">
                  {node.name}
                </span>
                <span className="rd-chip font-[var(--font-mono)] text-[10px]">
                  {typeLabels[node.type] ?? node.type}
                </span>
              </div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mb-[10px]">
                {node.ip} · up {node.uptime}
              </div>
              {/* CPU meter */}
              <div className="mb-[6px]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]">CPU</span>
                  <span className="font-[var(--font-mono)] font-semibold">{node.cpu}%</span>
                </div>
                <MeterBar value={node.cpu} />
              </div>
              {/* RAM meter */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]">RAM</span>
                  <span className="font-[var(--font-mono)] font-semibold">{node.memory}%</span>
                </div>
                <MeterBar value={node.memory} />
              </div>
            </div>
            {/* Right: mem GB */}
            <div className="text-right self-start">
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">
                {node.memoryUsed}/{node.memoryTotal} GB
              </div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mt-1">
                {node.services} svc
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { NodesTile };
