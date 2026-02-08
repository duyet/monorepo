"use client";

import { AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDowntimeHistory } from "@/hooks/useDashboard";
import { EXTERNAL_LINKS } from "@/lib/constants";

export function ServiceDowntime() {
  const { downtimeHistory } = useDowntimeHistory();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Service Downtime</CardTitle>
        <a
          href={EXTERNAL_LINKS.UPTIME_MONITOR}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View full history
          <ExternalLink className="h-3 w-3" />
        </a>
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
          <div className="space-y-2">
            {downtimeHistory.map((incident: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                <div className="rounded bg-orange-100 p-1 dark:bg-orange-900/30">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {incident.service}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {incident.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 whitespace-nowrap font-medium text-orange-600">
                      <Clock className="h-3 w-3" />
                      {incident.duration}
                    </div>
                  </div>
                  <div className="mt-1 flex gap-2 text-neutral-500 dark:text-neutral-500">
                    <span>{incident.start}</span>
                    <span>→</span>
                    <span>{incident.end}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
