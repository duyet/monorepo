'use client'

import { Card } from '../Card'
import { nodes } from '@/lib/mockData'

export function ClusterTopology() {
  return (
    <Card title="Cluster Topology">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900"
          >
            {/* Status indicator */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    node.status === 'online'
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      : node.status === 'degraded'
                        ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                        : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  }`}
                  title={node.status}
                />
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {node.type}
                </span>
              </div>
            </div>

            {/* Node name */}
            <h4 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {node.name}
            </h4>

            {/* IP address */}
            <p className="mb-3 font-mono text-sm text-neutral-600 dark:text-neutral-400">
              {node.ip}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-700">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">CPU</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {node.cpu}%
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Memory</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {node.memory}%
                </p>
              </div>
            </div>

            {/* Services count */}
            <div className="mt-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {node.services} services running
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster info footer */}
      <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Orchestration:</span> microk8s
        </p>
      </div>
    </Card>
  )
}
