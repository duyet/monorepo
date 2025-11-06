'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@duyet/components/ui/card'
import { downtimeHistory } from '@/lib/mockData'
import { AlertCircle, Clock } from 'lucide-react'

export function ServiceDowntime() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Service Downtime</CardTitle>
      </CardHeader>
      <CardContent>
      {downtimeHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <AlertCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-4 text-lg font-medium">All systems operational</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No service downtime recorded in the last 30 days
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downtimeHistory.map((incident, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-mono font-semibold">{incident.service}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {incident.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                    <Clock className="h-4 w-4" />
                    {incident.duration}
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>Start: {incident.start}</span>
                  <span>End: {incident.end}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  )
}
