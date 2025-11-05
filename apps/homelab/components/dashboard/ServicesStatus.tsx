'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { services } from '@/lib/mockData'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'

export function ServicesStatus() {
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null)

  // Get unique namespaces
  const namespaces = Array.from(new Set(services.map((s) => s.namespace))).sort()

  // Filter services based on selected namespace
  const filteredServices = selectedNamespace
    ? services.filter((s) => s.namespace === selectedNamespace)
    : services

  return (
    <Card title="Running Services">
      {/* Namespace filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedNamespace(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedNamespace === null
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          }`}
        >
          All ({services.length})
        </button>
        {namespaces.map((namespace) => (
          <button
            key={namespace}
            onClick={() => setSelectedNamespace(namespace)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedNamespace === namespace
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            {namespace} ({services.filter((s) => s.namespace === namespace).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div
            key={`${service.name}-${service.node}`}
            className="rounded-lg border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {service.status === 'running' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <h4 className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {service.name}
                  </h4>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {service.namespace}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {service.node} • Port {service.port}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">CPU</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {service.cpu}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Memory</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {service.memory}MB
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                <Activity className="h-3 w-3" />
                <span>Uptime: {service.uptime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
