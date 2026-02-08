/**
 * Default Alert Thresholds
 * Configurable thresholds for triggering alerts
 */

import type { AlertThreshold } from "./types";

export const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  // CPU Alerts
  {
    id: "cpu-node-critical",
    name: "Node CPU Critical",
    metric: "cpu",
    condition: "greater_than",
    threshold: 90,
    duration: 300, // 5 minutes
    severity: "critical",
    enabled: true,
  },
  {
    id: "cpu-node-warning",
    name: "Node CPU Warning",
    metric: "cpu",
    condition: "greater_than",
    threshold: 75,
    duration: 600, // 10 minutes
    severity: "warning",
    enabled: true,
  },
  // Memory Alerts
  {
    id: "memory-node-critical",
    name: "Node Memory Critical",
    metric: "memory",
    condition: "greater_than",
    threshold: 90,
    duration: 300,
    severity: "critical",
    enabled: true,
  },
  {
    id: "memory-node-warning",
    name: "Node Memory Warning",
    metric: "memory",
    condition: "greater_than",
    threshold: 80,
    duration: 600,
    severity: "warning",
    enabled: true,
  },
  // Disk Alerts (would need disk metrics)
  {
    id: "disk-node-warning",
    name: "Node Disk Warning",
    metric: "disk",
    condition: "greater_than",
    threshold: 85,
    duration: 600,
    severity: "warning",
    enabled: true,
  },
  // Service Status
  {
    id: "service-down-critical",
    name: "Service Down",
    metric: "service_status",
    condition: "equals",
    threshold: 0, // 0 means stopped/error
    duration: 60, // 1 minute
    severity: "critical",
    enabled: true,
  },
];

/**
 * Get user-configured thresholds from localStorage or use defaults
 */
export function getAlertThresholds(): AlertThreshold[] {
  if (typeof window === "undefined") {
    return DEFAULT_THRESHOLDS;
  }

  try {
    const stored = localStorage.getItem("alert_thresholds");
    if (stored) {
      return JSON.parse(stored) as AlertThreshold[];
    }
  } catch (error) {
    console.error("Failed to load alert thresholds:", error);
  }

  return DEFAULT_THRESHOLDS;
}

/**
 * Save alert thresholds to localStorage
 */
export function saveAlertThresholds(thresholds: AlertThreshold[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("alert_thresholds", JSON.stringify(thresholds));
  } catch (error) {
    console.error("Failed to save alert thresholds:", error);
  }
}

/**
 * Get enabled thresholds only
 */
export function getEnabledThresholds(): AlertThreshold[] {
  return getAlertThresholds().filter((t) => t.enabled);
}
