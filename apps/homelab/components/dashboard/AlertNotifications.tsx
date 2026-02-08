/**
 * Alert Notification Component
 * Displays active alerts with severity indicators
 */

"use client";

import { Bell, BellRing, X, Check, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { Alert } from "@/lib/alerts/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertNotificationsProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onClear?: () => void;
}

export function AlertNotifications({ alerts, onAcknowledge, onClear }: AlertNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  // Show notification badge when new alerts arrive
  useEffect(() => {
    if (alerts.length > previousCount && previousCount > 0) {
      // Could add sound or browser notification here
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Alert", {
          body: `${alerts.length - previousCount} new alert(s) triggered`,
          icon: "/favicon.svg",
        });
      }
    }
    setPreviousCount(alerts.length);
  }, [alerts.length, previousCount]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = activeAlerts.filter((a) => a.severity === "info").length;

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Notifications"
      >
        {activeAlerts.length > 0 ? (
          <BellRing className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
        ) : (
          <Bell className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
        )}
        {activeAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {activeAlerts.length > 9 ? "9+" : activeAlerts.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-h-[80vh] overflow-hidden rounded-3xl border bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Alerts</CardTitle>
                <div className="flex gap-2">
                  {criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {criticalCount} Critical
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      {warningCount} Warning
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Check className="h-12 w-12 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      All systems normal
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      No active alerts
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {alert.title}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                {alert.message}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                {new Date(alert.triggeredAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {onAcknowledge && (
                            <button
                              onClick={() => onAcknowledge(alert.id)}
                              className="flex-shrink-0 rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                              title="Acknowledge"
                            >
                              <Check className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
