import { Activity, CheckCircle2, XCircle } from "lucide-react";
import type { Service } from "@/lib/data";

interface ServiceCardProps {
  service: Service;
}

/**
 * ServiceCard Component
 * Displays a single service with its status, metrics, and metadata
 */
export function ServiceCard({ service }: ServiceCardProps) {
  const statusIcon =
    service.status === "running" ? (
      <CheckCircle2 className="h-4 w-4 text-[var(--rd-ok)]" aria-label="Running" />
    ) : service.status === "error" ? (
      <XCircle className="h-4 w-4 text-[var(--rd-down)]" aria-label="Error" />
    ) : (
      <Activity className="h-4 w-4 text-[var(--rd-warn)]" aria-label="Stopped" />
    );

  return (
    <article
      className="rd-card p-4"
      aria-label={`Service ${service.name}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Service name and status */}
          <div className="mb-1 flex items-center gap-2">
            {statusIcon}
            <h4 className="break-all font-[var(--font-mono)] text-sm font-semibold text-[var(--rd-text)]">
              {service.name}
            </h4>
          </div>

          {/* Namespace badge */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rd-chip">
              {service.namespace}
            </span>
          </div>

          {/* Node and port info */}
          <p className="text-xs text-[var(--rd-text-3)]">
            <span className="font-medium">{service.node}</span> · Port{" "}
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
          <span className="text-[var(--rd-text-3)]">CPU</span>
          <span
            className="font-medium text-[var(--rd-text)]"
            aria-label={`CPU usage: ${service.cpu} percent`}
          >
            {service.cpu}%
          </span>
        </div>

        <div
          className="flex items-center justify-between text-xs"
          role="listitem"
        >
          <span className="text-[var(--rd-text-3)]">Memory</span>
          <span
            className="font-medium text-[var(--rd-text)]"
            aria-label={`Memory usage: ${service.memory} megabytes`}
          >
            {service.memory}MB
          </span>
        </div>

        <div
          className="flex items-center gap-1 text-xs text-[var(--rd-text-3)]"
          role="listitem"
        >
          <Activity className="h-3 w-3" aria-hidden="true" />
          <span>Uptime: {service.uptime}</span>
        </div>
      </div>
    </article>
  );
}
