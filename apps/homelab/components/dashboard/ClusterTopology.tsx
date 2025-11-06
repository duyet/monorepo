'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@duyet/components/ui/card'
import { nodes } from '@/lib/mockData'

export function ClusterTopology() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster Topology</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            {/* Line 1: Status indicator and node name */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  node.status === 'online'
                    ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                    : node.status === 'degraded'
                      ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                      : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                }`}
                title={node.status}
              />
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {node.name}
              </h4>
            </div>

            {/* Line 2: IP address and deployments */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-600 dark:text-neutral-400">
                {node.ip}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {node.services} deploy
              </span>
            </div>

            {/* Quick stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">CPU:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {node.cpu}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">RAM:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {node.memory}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Uptime:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {node.uptime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster info footer */}
      <div className="mt-4 pt-3">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Orchestration:</span> microk8s
        </p>
      </div>
      </CardContent>
    </Card>
  )
}
