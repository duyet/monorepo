'use client'

import { Card } from '@/components/Card'
import { clusterStats, nodes } from '@/lib/mockData'
import { Activity, CheckCircle2, Database, HardDrive, Server } from 'lucide-react'

export function ClusterOverview() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-3xl bg-[#c5c5ff] p-6 dark:bg-[#c5c5ff]/20">
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

        <div className="rounded-3xl bg-[#a8d5ba] p-6 dark:bg-[#a8d5ba]/20">
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

        <div className="rounded-3xl bg-[#f5dcd0] p-6 dark:bg-[#f5dcd0]/20">
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

        <div className="rounded-3xl bg-[#f0d9a8] p-6 dark:bg-[#f0d9a8]/20">
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

        <div className="rounded-3xl bg-white p-6 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Storage
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {(clusterStats.totalStorage / 1024).toFixed(1)}
                <span className="text-lg text-neutral-700 dark:text-neutral-400">TiB</span>
              </p>
              <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">
                Total capacity
              </p>
            </div>
            <Database className="h-10 w-10 text-neutral-700 dark:text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Node Details */}
      <Card title="Cluster Nodes">
        <div className="space-y-3">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <div className="flex items-center gap-4">
                {/* Status dot indicator */}
                <div
                  className={`h-3 w-3 rounded-full ${
                    node.status === 'online'
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      : node.status === 'degraded'
                        ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                        : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  }`}
                  title={node.status}
                />
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {node.name}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{node.ip}</p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">CPU</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {node.cpu}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Memory</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {node.memory}%
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {node.memoryUsed.toFixed(1)}/{node.memoryTotal}GB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Services</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {node.services}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Uptime</p>
                  <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {node.uptime}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
