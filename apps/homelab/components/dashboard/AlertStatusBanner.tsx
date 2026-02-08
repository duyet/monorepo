/**
 * Alert Status Banner Component
 * Shows a summary banner when there are active critical alerts
 */

"use client";

import { AlertCircle, X } from "lucide-react";
import type { Alert } from "@/lib/alerts/types";

interface AlertStatusBannerProps {
  alerts: Alert[];
  onDismiss?: () => void;
}

export function AlertStatusBanner({ alerts, onDismiss }: AlertStatusBannerProps) {
  const criticalAlerts = alerts.filter((a) => a.status === "active" && a.severity === "critical");

  if (criticalAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-3xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 animate-pulse" />
          <div>
            <p className="font-semibold">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? "s" : ""} Active
            </p>
            <p className="text-sm text-red-100 mt-0.5">
              {criticalAlerts[0].title}
              {criticalAlerts.length > 1 && ` (+${criticalAlerts.length - 1} more)`}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-full p-1 hover:bg-red-600/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
