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
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
              Total Nodes
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {clusterStats.totalNodes}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              {clusterStats.onlineNodes} online
            </p>
          </div>
          <Server className="h-10 w-10 text-violet-500 dark:text-violet-400" />
        </div>
      </div>

      {/* Services */}
      <div className={BENTO_CELL}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Services
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {clusterStats.totalServices}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
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
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {clusterStats.avgCpu.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
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
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {clusterStats.usedMemory.toFixed(0)}
              <span className="text-lg text-neutral-600 dark:text-neutral-400">
                /{clusterStats.totalMemory}GB
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
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
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Storage
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {(clusterStats.totalStorage / 1024).toFixed(1)}
              <span className="text-lg text-neutral-600 dark:text-neutral-400">
                GiB
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Total capacity
            </p>
          </div>
          <Database className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
        </div>
      </div>
    </div>
  );
}
