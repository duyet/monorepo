"use client";

import { AlertCircle, Clock, ExternalLink } from "lucide-react";
import { useDowntimeHistory } from "@/hooks/useDashboard";
import { EXTERNAL_LINKS } from "@/lib/constants";

export function ServiceDowntime() {
  const downtimeHistory = useDowntimeHistory();
  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-foreground">
          Recent Service Downtime
        </h2>
        <a
          href={EXTERNAL_LINKS.UPTIME_MONITOR}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950 dark:text-muted-foreground dark:hover:text-foreground"
        >
          View full history
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {downtimeHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-xl bg-[#eef8e8] p-4 dark:bg-emerald-950/30">
            <AlertCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-4 text-lg font-medium">All systems operational</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No service downtime recorded in the last 30 days
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {downtimeHistory.map((incident, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border border-[#e8e0d4] bg-white p-2 dark:border-white/12 dark:bg-[#1a1a1a]"
            >
              <div className="rounded bg-orange-100 p-1 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-mono font-semibold text-neutral-950 dark:text-foreground">
                      {incident.service}
                    </h4>
                    <p className="text-neutral-600 dark:text-muted-foreground">
                      {incident.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 whitespace-nowrap font-medium text-orange-600">
                    <Clock className="h-3 w-3" />
                    {incident.duration}
                  </div>
                </div>
                <div className="mt-1 flex gap-2 text-neutral-500 dark:text-muted-foreground">
                  <span>{incident.start}</span>
                  <span>→</span>
                  <span>{incident.end}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
