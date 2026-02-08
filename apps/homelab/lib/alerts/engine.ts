/**
 * Alert Engine
 * Evaluates metrics against thresholds and generates alerts
 */

import type { Alert, AlertThreshold } from "./types";
import type { Node, Service } from "@/hooks/useDashboard";

interface MetricValue {
  entity: string;
  entityType: "node" | "service";
  metric: "cpu" | "memory" | "disk" | "service_status";
  value: number;
  timestamp: Date;
}

/**
 * Alert Engine class
 */
export class AlertEngine {
  private thresholds: AlertThreshold[];
  private activeAlerts: Map<string, Alert>;
  private alertHistory: Alert[];
  private listeners: Set<(alert: Alert) => void>;

  constructor() {
    this.thresholds = [];
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.listeners = new Set();
  }

  /**
   * Set thresholds to use for evaluation
   */
  setThresholds(thresholds: AlertThreshold[]): void {
    this.thresholds = thresholds.filter((t) => t.enabled);
  }

  /**
   * Subscribe to new alerts
   */
  subscribe(callback: (alert: Alert) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Evaluate node metrics against thresholds
   */
  evaluateNodes(nodes: Node[]): Alert[] {
    const newAlerts: Alert[] = [];
    const now = new Date();

    for (const node of nodes) {
      if (node.status === "offline") {
        // Node is offline, this is always critical
        const alert: Alert = {
          id: `node-offline-${node.id}`,
          thresholdId: "node-offline",
          severity: "critical",
          status: "active",
          title: `Node ${node.name} is Offline`,
          message: `Node ${node.name} (${node.ip}) is not responding`,
          entity: node.name,
          entityType: "node",
          value: 0,
          threshold: 1,
          triggeredAt: now,
        };
        newAlerts.push(alert);
        continue;
      }

      // Check CPU thresholds
      for (const threshold of this.thresholds.filter((t) => t.metric === "cpu")) {
        if (this.evaluateCondition(node.cpu, threshold)) {
          const alert: Alert = {
            id: `${threshold.id}-${node.id}-${Date.now()}`,
            thresholdId: threshold.id,
            severity: threshold.severity,
            status: "active",
            title: `${threshold.name}: ${node.name}`,
            message: `CPU usage is ${node.cpu.toFixed(1)}% (threshold: ${threshold.threshold}%)`,
            entity: node.name,
            entityType: "node",
            value: node.cpu,
            threshold: threshold.threshold,
            triggeredAt: now,
          };
          newAlerts.push(alert);
        }
      }

      // Check Memory thresholds
      for (const threshold of this.thresholds.filter((t) => t.metric === "memory")) {
        if (this.evaluateCondition(node.memory, threshold)) {
          const alert: Alert = {
            id: `${threshold.id}-${node.id}-${Date.now()}`,
            thresholdId: threshold.id,
            severity: threshold.severity,
            status: "active",
            title: `${threshold.name}: ${node.name}`,
            message: `Memory usage is ${node.memory.toFixed(1)}% (threshold: ${threshold.threshold}%)`,
            entity: node.name,
            entityType: "node",
            value: node.memory,
            threshold: threshold.threshold,
            triggeredAt: now,
          };
          newAlerts.push(alert);
        }
      }
    }

    return newAlerts;
  }

  /**
   * Evaluate service status
   */
  evaluateServices(services: Service[]): Alert[] {
    const newAlerts: Alert[] = [];
    const now = new Date();

    for (const service of services) {
      if (service.status !== "running") {
        const alert: Alert = {
          id: `service-down-${service.name}-${Date.now()}`,
          thresholdId: "service-down-critical",
          severity: "critical",
          status: "active",
          title: `Service Down: ${service.name}`,
          message: `Service ${service.name} in namespace ${service.namespace} is ${service.status}`,
          entity: service.name,
          entityType: "service",
          value: 0,
          threshold: 1,
          triggeredAt: now,
        };
        newAlerts.push(alert);
      }
    }

    return newAlerts;
  }

  /**
   * Evaluate a condition against a threshold
   */
  private evaluateCondition(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.condition) {
      case "greater_than":
        return value > threshold.threshold;
      case "less_than":
        return value < threshold.threshold;
      case "equals":
        return value === threshold.threshold;
      case "not_equals":
        return value !== threshold.threshold;
      default:
        return false;
    }
  }

  /**
   * Process metrics and generate alerts
   */
  processMetrics(nodes: Node[], services: Service[]): Alert[] {
    const nodeAlerts = this.evaluateNodes(nodes);
    const serviceAlerts = this.evaluateServices(services);
    const allAlerts = [...nodeAlerts, ...serviceAlerts];

    // Update active alerts
    for (const alert of allAlerts) {
      const existingKey = `${alert.thresholdId}-${alert.entity}`;
      if (!this.activeAlerts.has(existingKey)) {
        // New alert
        this.activeAlerts.set(existingKey, alert);
        this.alertHistory.push(alert);
        // Notify listeners
        this.listeners.forEach((listener) => listener(alert));
      }
    }

    // Check for resolved alerts
    const triggeredEntities = new Set(
      allAlerts.map((a) => `${a.thresholdId}-${a.entity}`)
    );

    for (const [key, alert] of this.activeAlerts) {
      if (!triggeredEntities.has(key)) {
        // Alert is resolved
        alert.status = "resolved";
        alert.resolvedAt = new Date();
        this.activeAlerts.delete(key);
      }
    }

    return allAlerts;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = "acknowledged";
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
    }
  }

  /**
   * Get alert statistics
   */
  getStats() {
    const active = this.getActiveAlerts();
    return {
      total: this.alertHistory.length,
      active: active.length,
      critical: active.filter((a) => a.severity === "critical").length,
      warning: active.filter((a) => a.severity === "warning").length,
      info: active.filter((a) => a.severity === "info").length,
    };
  }

  /**
   * Clear all alerts (for testing)
   */
  clearAlerts(): void {
    this.activeAlerts.clear();
    this.alertHistory = [];
  }
}

/**
 * Singleton instance
 */
let alertEngine: AlertEngine | null = null;

export function getAlertEngine(): AlertEngine {
  if (!alertEngine) {
    alertEngine = new AlertEngine();
  }
  return alertEngine;
}

export function resetAlertEngine(): void {
  alertEngine = null;
}
