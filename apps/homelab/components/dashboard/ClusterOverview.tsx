'use client'

import { Card } from '@/components/Card'
import { clusterStats, nodes } from '@/lib/mockData'
import { Activity, CheckCircle2, HardDrive, Server } from 'lucide-react'

export function ClusterOverview() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-gradient-to-br from-claude-lavender to-white p-6 dark:from-purple-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Total Nodes
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {clusterStats.totalNodes}
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                {clusterStats.onlineNodes} online
              </p>
            </div>
            <Server className="h-12 w-12 text-neutral-400" />
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-claude-mint to-white p-6 dark:from-green-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Services
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {clusterStats.totalServices}
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                {clusterStats.runningServices} running
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-neutral-400" />
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-claude-peach to-white p-6 dark:from-orange-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Avg CPU
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {clusterStats.avgCpu.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Across all nodes
              </p>
            </div>
            <Activity className="h-12 w-12 text-neutral-400" />
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-claude-yellow to-white p-6 dark:from-yellow-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
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
            <HardDrive className="h-12 w-12 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Node Details */}
      <Card title="Cluster Nodes">
        <div className="space-y-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    node.status === 'online'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <Server
                    className={`h-6 w-6 ${
                      node.status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{node.name}</h4>
                  <p className="text-sm text-muted-foreground">{node.ip}</p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="mt-1 text-lg font-semibold">{node.cpu}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Memory</p>
                  <p className="mt-1 text-lg font-semibold">{node.memory}%</p>
                  <p className="text-xs text-muted-foreground">
                    {node.memoryUsed.toFixed(1)}/{node.memoryTotal}GB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Services</p>
                  <p className="mt-1 text-lg font-semibold">{node.services}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="mt-1 text-sm font-medium">{node.uptime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
