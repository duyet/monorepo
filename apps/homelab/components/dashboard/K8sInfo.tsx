"use client";

import { Box, Cuboid, Layers, RotateCcw } from "lucide-react";
import { useK8s } from "@/hooks/useDashboard";

const STATUS_STYLES: Record<string, string> = {
  running: "text-[var(--rd-ok)]",
  pending: "text-[var(--rd-warn)]",
  crashloop: "text-[var(--rd-down)]",
  completed: "text-[var(--rd-text-3)]",
};

export function K8sInfo() {
  const { pods, summary } = useK8s();

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
          <div className="flex items-center gap-2 text-[var(--rd-text-3)]">
            <Cuboid size={14} />
            <p className="text-xs font-medium">Namespaces</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">{summary.namespaces}</p>
        </div>
        <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
          <div className="flex items-center gap-2 text-[var(--rd-ok)]">
            <Box size={14} />
            <p className="text-xs font-medium">Pods</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
            {summary.running}<span className="text-base text-[var(--rd-text-3)]">/{summary.pods}</span>
          </p>
          <p className="text-xs text-[var(--rd-text-3)]">running</p>
        </div>
        <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
          <div className="flex items-center gap-2 text-[var(--rd-accent)]">
            <Layers size={14} />
            <p className="text-xs font-medium">Deployments</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">{summary.deployments}</p>
        </div>
        <div className="p-4 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
          <div className="flex items-center gap-2 text-[var(--rd-warn)]">
            <RotateCcw size={14} />
            <p className="text-xs font-medium">Restarts</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">{summary.totalRestarts}</p>
          <p className="text-xs text-[var(--rd-text-3)]">total</p>
        </div>
      </div>

      {/* Pod table */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--rd-text)]">
          Pods
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--rd-line)] text-left">
                <th className="pb-2 font-medium text-[var(--rd-text-3)]">Name</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)]">Namespace</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)]">Node</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)]">Status</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)] text-right">Restarts</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)] text-right">CPU</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)] text-right">Memory</th>
                <th className="pb-2 font-medium text-[var(--rd-text-3)] text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {pods.map((pod) => (
                <tr
                  key={pod.name}
                  className="border-b border-[var(--rd-line)] hover:bg-[var(--rd-surface-2)] transition-colors"
                >
                  <td className="py-2.5 pr-4 font-[var(--font-mono)] font-medium text-[var(--rd-text)] max-w-[200px] truncate">
                    {pod.name}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="rd-chip">{pod.namespace}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--rd-text-2)]">{pod.node}</td>
                  <td className={`py-2.5 pr-4 font-medium ${STATUS_STYLES[pod.status] ?? "text-[var(--rd-text)]"}`}>
                    {pod.status}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-[var(--rd-text-2)]">{pod.restarts}</td>
                  <td className="py-2.5 pr-4 text-right font-[var(--font-mono)] text-[var(--rd-text-2)]">{pod.cpu}</td>
                  <td className="py-2.5 pr-4 text-right font-[var(--font-mono)] text-[var(--rd-text-2)]">{pod.memory}</td>
                  <td className="py-2.5 text-right text-[var(--rd-text-3)]">{pod.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}