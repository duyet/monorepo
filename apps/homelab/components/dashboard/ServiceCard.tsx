import { Activity, CheckCircle2, XCircle } from 'lucide-react'
import type { Service } from '@/lib/mockData'

interface ServiceCardProps {
  service: Service
}

/**
 * ServiceCard Component
 * Displays a single service with its status, metrics, and metadata
 */
export function ServiceCard({ service }: ServiceCardProps) {
  const statusIcon =
    service.status === 'running' ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Running" />
    ) : service.status === 'error' ? (
      <XCircle className="h-4 w-4 text-red-500" aria-label="Error" />
    ) : (
      <Activity className="h-4 w-4 text-yellow-500" aria-label="Stopped" />
    )

  return (
    <article
      className="rounded-lg border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50"
      aria-label={`Service ${service.name}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Service name and status */}
          <div className="mb-1 flex items-center gap-2">
            {statusIcon}
            <h4 className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {service.name}
            </h4>
          </div>

          {/* Namespace badge */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
              {service.namespace}
            </span>
          </div>

          {/* Node and port info */}
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">{service.node}</span> • Port{' '}
            {service.port}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-3 space-y-2" role="list" aria-label="Service metrics">
        <div
          className="flex items-center justify-between text-xs"
          role="listitem"
        >
          <span className="text-neutral-600 dark:text-neutral-400">CPU</span>
          <span
            className="font-medium text-neutral-900 dark:text-neutral-100"
            aria-label={`CPU usage: ${service.cpu} percent`}
          >
            {service.cpu}%
          </span>
        </div>

        <div
          className="flex items-center justify-between text-xs"
          role="listitem"
        >
          <span className="text-neutral-600 dark:text-neutral-400">
            Memory
          </span>
          <span
            className="font-medium text-neutral-900 dark:text-neutral-100"
            aria-label={`Memory usage: ${service.memory} megabytes`}
          >
            {service.memory}MB
          </span>
        </div>

        <div
          className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400"
          role="listitem"
        >
          <Activity className="h-3 w-3" aria-hidden="true" />
          <span>Uptime: {service.uptime}</span>
        </div>
      </div>
    </article>
  )
}
