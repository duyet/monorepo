"use client";

import {
  Activity,
  CheckCircle2,
  Database,
  HardDrive,
  Server,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useClusterStats } from "@/hooks/useDashboard";

export function ClusterOverview() {
  const clusterStats = useClusterStats();
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Nodes — violet */}
          <div className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-100 to-violet-50 p-6 dark:border-violet-700/20 dark:from-violet-900/25 dark:to-violet-950/10">
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

          {/* Services — emerald */}
          <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100 to-emerald-50 p-6 dark:border-emerald-700/20 dark:from-emerald-900/25 dark:to-emerald-950/10">
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

          {/* Avg CPU — orange */}
          <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-100 to-orange-50 p-6 dark:border-orange-700/20 dark:from-orange-900/25 dark:to-orange-950/10">
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

          {/* Memory — amber */}
          <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-100 to-amber-50 p-6 dark:border-amber-700/20 dark:from-amber-900/25 dark:to-amber-950/10">
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

          {/* Storage — neutral */}
          <div className="rounded-3xl border border-neutral-200/70 bg-gradient-to-br from-neutral-100 to-neutral-50 p-6 dark:border-neutral-700/20 dark:from-neutral-800/30 dark:to-neutral-900/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Storage
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {(clusterStats.totalStorage / 1024).toFixed(1)}
                  <span className="text-lg text-neutral-600 dark:text-neutral-400">
                    TiB
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
      </CardContent>
    </Card>
  );
}
