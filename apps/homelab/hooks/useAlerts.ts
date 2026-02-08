/**
 * React Hook for Alert System
 * Manages alert state and provides alert operations
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Alert, AlertThreshold, AlertStats } from "@/lib/alerts/types";
import { getAlertEngine, AlertEngine } from "@/lib/alerts/engine";
import { getAlertThresholds, getEnabledThresholds } from "@/lib/alerts/thresholds";
import type { Node, Service } from "./useDashboard";

export function useAlerts(nodes: Node[], services: Service[]) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    active: 0,
    critical: 0,
    warning: 0,
    info: 0,
  });
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);

  // Initialize alert engine
  useEffect(() => {
    const engine = getAlertEngine();

    // Load thresholds
    const loadedThresholds = getAlertThresholds();
    setThresholds(loadedThresholds);
    engine.setThresholds(getEnabledThresholds());

    // Subscribe to new alerts
    const unsubscribe = engine.subscribe((alert) => {
      setAlerts((prev) => {
        const exists = prev.some((a) => a.id === alert.id);
        if (!exists) {
          return [...prev, alert];
        }
        return prev;
      });
    });

    // Initial stats
    setStats(engine.getStats());
    setAlertHistory(engine.getAlertHistory());

    return () => {
      unsubscribe();
    };
  }, []);

  // Process metrics when nodes or services change
  useEffect(() => {
    const engine = getAlertEngine();
    const newAlerts = engine.processMetrics(nodes, services);

    // Update active alerts
    setAlerts(engine.getActiveAlerts());
    setAlertHistory(engine.getAlertHistory());
    setStats(engine.getStats());
  }, [nodes, services]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string, acknowledgedBy: string = "user") => {
    const engine = getAlertEngine();
    engine.acknowledgeAlert(alertId, acknowledgedBy);
    setAlerts(engine.getActiveAlerts());
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    const engine = getAlertEngine();
    engine.clearAlerts();
    setAlerts([]);
    setAlertHistory([]);
    setStats({
      total: 0,
      active: 0,
      critical: 0,
      warning: 0,
      info: 0,
    });
  }, []);

  // Update thresholds
  const updateThresholds = useCallback((newThresholds: AlertThreshold[]) => {
    setThresholds(newThresholds);
    const engine = getAlertEngine();
    engine.setThresholds(newThresholds.filter((t) => t.enabled));
  }, []);

  // Get alerts by severity
  const criticalAlerts = useMemo(() => alerts.filter((a) => a.severity === "critical"), [alerts]);
  const warningAlerts = useMemo(() => alerts.filter((a) => a.severity === "warning"), [alerts]);
  const infoAlerts = useMemo(() => alerts.filter((a) => a.severity === "info"), [alerts]);

  return {
    alerts,
    alertHistory,
    stats,
    thresholds,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    acknowledgeAlert,
    clearAlerts,
    updateThresholds,
  };
}
