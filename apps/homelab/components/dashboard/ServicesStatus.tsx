'use client'

import { Card } from '@/components/Card'
import { services } from '@/lib/mockData'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'

export function ServicesStatus() {
  return (
    <Card title="Running Services">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={`${service.name}-${service.node}`}
            className="rounded-lg border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {service.status === 'running' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <h4 className="font-mono text-sm font-semibold">{service.name}</h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {service.node} • Port {service.port}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CPU</span>
                <span className="font-medium">{service.cpu}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-medium">{service.memory}MB</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
