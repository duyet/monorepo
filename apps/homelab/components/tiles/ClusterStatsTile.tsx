import { Activity } from "lucide-react";
import { Sparkline } from "@duyet/components";
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
    <div className="rd-card md:col-span-1 p-[clamp(14px,1.8vw,22px)]">
      <div className="flex items-center justify-between mb-3">
        <span className="rd-eyebrow">
          <Activity size={13} />
          Cluster
        </span>
      </div>

      {/* Avg CPU */}
      <div className="flex items-center justify-between py-2.5 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Avg CPU
        </span>
        <div className="flex items-center gap-3">
          <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
            {stats.avgCpu.toFixed(1)}
            <span className="rd-unit">%</span>
          </span>
          <div className="w-16">
            <Sparkline data={cpuData} h={20} />
          </div>
        </div>
      </div>

      {/* Memory */}
      <div className="flex items-center justify-between py-2.5 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Memory
        </span>
        <div className="flex items-center gap-3">
          <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
            {stats.usedMemory.toFixed(0)}
            <span className="rd-unit">/ {stats.totalMemory} GB</span>
          </span>
          <div className="w-16">
            <Sparkline data={memData} h={20} />
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="flex items-center justify-between py-2.5 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Storage
        </span>
        <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
          {(stats.totalStorage / 1024).toFixed(1)}
          <span className="rd-unit">TB</span>
        </span>
      </div>

      {/* Incidents */}
      <div className="flex items-center justify-between py-2.5">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Incidents
        </span>
        <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
          {downtimeHistory.length}
          <span className="rd-unit">recent</span>
        </span>
      </div>
    </div>
  );
}
