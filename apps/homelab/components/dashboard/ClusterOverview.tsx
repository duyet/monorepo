"use client";

import {
  Activity,
  CheckCircle2,
  Database,
  HardDrive,
  Server,
} from "lucide-react";
import { useClusterStats } from "@/hooks/useDashboard";
import { BENTO_CELL } from "@/lib/constants";

export function ClusterOverview() {
  const clusterStats = useClusterStats();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Nodes */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--rd-text-3)]">
              Total Nodes
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {clusterStats.totalNodes}
            </p>
            <p className="mt-1 text-xs text-[var(--rd-ok)]">
              {clusterStats.onlineNodes} online
            </p>
          </div>
          <Server className="h-9 w-9 text-[var(--rd-accent)]" />
        </div>
      </div>

      {/* Services */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--rd-ok)]">
              Services
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {clusterStats.totalServices}
            </p>
            <p className="mt-1 text-xs text-[var(--rd-ok)]">
              {clusterStats.runningServices} running
            </p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-[var(--rd-ok)]" />
        </div>
      </div>

      {/* Avg CPU */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--rd-accent)]">
              Avg CPU
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {clusterStats.avgCpu.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-[var(--rd-text-3)]">
              Across all nodes
            </p>
          </div>
          <Activity className="h-10 w-10 text-[var(--rd-accent)]" />
        </div>
      </div>

      {/* Memory */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--rd-warn)]">
              Memory
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {clusterStats.usedMemory.toFixed(0)}
              <span className="text-base text-[var(--rd-text-3)]">
                /{clusterStats.totalMemory}GB
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--rd-text-3)]">
              {clusterStats.avgMemory.toFixed(1)}% used
            </p>
          </div>
          <HardDrive className="h-10 w-10 text-[var(--rd-warn)]" />
        </div>
      </div>

      {/* Storage */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--rd-text-3)]">
              Storage
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--rd-text)]">
              {(clusterStats.totalStorage / 1024).toFixed(1)}
              <span className="text-base text-[var(--rd-text-3)]">
                GiB
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--rd-text-3)]">
              Total capacity
            </p>
          </div>
          <Database className="h-10 w-10 text-[var(--rd-text-3)]" />
        </div>
      </div>
    </div>
  );
}
