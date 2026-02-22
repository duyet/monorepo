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
          <div className="rounded-3xl bg-claude-lavender p-6 dark:bg-claude-lavender/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Total Nodes
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {clusterStats.totalNodes}
                </p>
                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  {clusterStats.onlineNodes} online
                </p>
              </div>
              <Server className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-claude-mint p-6 dark:bg-claude-mint/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Services
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {clusterStats.totalServices}
                </p>
                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  {clusterStats.runningServices} running
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-claude-peach p-6 dark:bg-claude-peach/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Avg CPU
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {clusterStats.avgCpu.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">
                  Across all nodes
                </p>
              </div>
              <Activity className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-claude-yellow p-6 dark:bg-claude-yellow/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Memory
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {clusterStats.usedMemory.toFixed(0)}
                  <span className="text-lg text-neutral-700 dark:text-neutral-400">
                    /{clusterStats.totalMemory}GB
                  </span>
                </p>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">
                  {clusterStats.avgMemory.toFixed(1)}% used
                </p>
              </div>
              <HardDrive className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-neutral-200 p-6 dark:bg-neutral-200/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Storage
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {(clusterStats.totalStorage / 1024).toFixed(1)}
                  <span className="text-lg text-neutral-700 dark:text-neutral-400">
                    TiB
                  </span>
                </p>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">
                  Total capacity
                </p>
              </div>
              <Database className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
