"use client";

import { AlertCircle, Clock, ExternalLink } from "lucide-react";
import { useDowntimeHistory } from "@/hooks/useDashboard";
import { EXTERNAL_LINKS } from "@/lib/constants";

export function ServiceDowntime() {
  const downtimeHistory = useDowntimeHistory();
  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-[var(--rd-text)]">
          Recent Service Downtime
        </h2>
        <a
          href={EXTERNAL_LINKS.UPTIME_MONITOR}
          target="_blank"
          rel="noopener noreferrer"
          className="rd-ulink flex items-center gap-1 text-xs"
        >
          View full history
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {downtimeHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-xl bg-[var(--rd-accent-bg)] p-4">
            <AlertCircle className="h-8 w-8 text-[var(--rd-ok)]" />
          </div>
          <p className="mt-4 text-lg font-medium text-[var(--rd-text)]">All systems operational</p>
          <p className="mt-2 text-sm text-[var(--rd-text-3)]">
            No service downtime recorded in the last 30 days
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {downtimeHistory.map((incident, index) => (
            <div
              key={index}
              className="rd-card flex items-start gap-2 p-2"
            >
              <div className="rounded bg-[var(--rd-accent-bg)] p-1">
                <AlertCircle className="h-4 w-4 text-[var(--rd-accent)]" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-[var(--font-mono)] font-semibold text-[var(--rd-text)]">
                      {incident.service}
                    </h4>
                    <p className="text-[var(--rd-text-3)]">
                      {incident.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 whitespace-nowrap font-medium text-[var(--rd-accent)]">
                    <Clock className="h-3 w-3" />
                    {incident.duration}
                  </div>
                </div>
                <div className="mt-1 flex gap-2 text-[var(--rd-text-4)]">
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
