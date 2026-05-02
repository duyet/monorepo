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
            <p className="text-xs font-medium text-neutral-700 dark:text-muted-foreground">
              Total Nodes
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {clusterStats.totalNodes}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-700">
              {clusterStats.onlineNodes} online
            </p>
          </div>
          <Server className="h-9 w-9 text-[#b8b5ff] dark:text-[#b8b5ff]" />
        </div>
      </div>

      {/* Services */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Services
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {clusterStats.totalServices}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-700">
              {clusterStats.runningServices} running
            </p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
        </div>
      </div>

      {/* Avg CPU */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
              Avg CPU
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {clusterStats.avgCpu.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-muted-foreground">
              Across all nodes
            </p>
          </div>
          <Activity className="h-10 w-10 text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Memory */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Memory
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {clusterStats.usedMemory.toFixed(0)}
              <span className="text-base text-neutral-600 dark:text-muted-foreground">
                /{clusterStats.totalMemory}GB
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-muted-foreground">
              {clusterStats.avgMemory.toFixed(1)}% used
            </p>
          </div>
          <HardDrive className="h-10 w-10 text-amber-500 dark:text-amber-400" />
        </div>
      </div>

      {/* Storage */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-600 dark:text-muted-foreground">
              Storage
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-foreground">
              {(clusterStats.totalStorage / 1024).toFixed(1)}
              <span className="text-base text-neutral-600 dark:text-muted-foreground">
                GiB
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-muted-foreground">
              Total capacity
            </p>
          </div>
          <Database className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
        </div>
      </div>
    </div>
  );
}
