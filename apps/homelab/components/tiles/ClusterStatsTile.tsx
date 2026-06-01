import {
  Activity,
  AlertCircle,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
} from "lucide-react";
import type { ClusterStats, Service, ServiceDowntime } from "@/lib/data/types";
import { MeterBar } from "./MeterBar";

function ClusterStatsTile({
  clusterStats,
  memPercent,
  totalServiceMem,
  busiestSvc,
  downtimeHistory,
  serviceCount,
}: {
  clusterStats: ClusterStats;
  memPercent: number;
  totalServiceMem: number;
  busiestSvc: Service | undefined;
  downtimeHistory: ServiceDowntime[];
  serviceCount: number;
}) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center gap-2 mb-[18px]">
        <Activity size={14} style={{ color: "var(--rd-text-3)" }} />
        <span className="rd-eyebrow">Cluster</span>
      </div>
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5"
      >
        {/* Avg CPU */}
        <div>
          <div className="rd-eyebrow mb-2">
            <Activity size={12} />
            Avg CPU
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {clusterStats.avgCpu.toFixed(1)}
            <span className="rd-unit">%</span>
          </div>
          <MeterBar value={clusterStats.avgCpu} />
        </div>

        {/* Memory */}
        <div>
          <div className="rd-eyebrow mb-2">
            <HardDrive size={12} />
            Memory
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {clusterStats.usedMemory.toFixed(0)}
            <span className="rd-unit">/ {clusterStats.totalMemory} GB</span>
          </div>
          <MeterBar value={memPercent} />
        </div>

        {/* Storage */}
        <div>
          <div className="rd-eyebrow mb-2">
            <Database size={12} />
            Storage
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {(clusterStats.totalStorage / 1024).toFixed(1)}
            <span className="rd-unit">TB</span>
          </div>
        </div>

        {/* Incidents */}
        <div>
          <div className="rd-eyebrow mb-2">
            <AlertCircle size={12} />
            Incidents
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {downtimeHistory.length}
            <span className="rd-unit">recent</span>
          </div>
        </div>

        {/* Svc memory */}
        <div>
          <div className="rd-eyebrow mb-2">
            <MemoryStick size={12} />
            Svc memory
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {(totalServiceMem / 1024).toFixed(1)}
            <span className="rd-unit">GB</span>
          </div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mt-[6px]">
            {serviceCount} services
          </div>
        </div>

        {/* Top service by CPU */}
        {busiestSvc ? (
          <div>
            <div className="rd-eyebrow mb-2">
              <Cpu size={12} />
              Top service
            </div>
            <div
              className="font-[var(--font-mono)] font-semibold text-[13.5px] truncate"
            >
              {busiestSvc.name}
            </div>
            <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem] mt-1">
              {busiestSvc.cpu.toFixed(1)}
              <span className="rd-unit">% CPU</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { ClusterStatsTile };
