/**
 * Alert System Types
 */

export interface AlertThreshold {
  id: string;
  name: string;
  metric: "cpu" | "memory" | "disk" | "network" | "service_status";
  condition: "greater_than" | "less_than" | "equals" | "not_equals";
  threshold: number;
  duration: number; // seconds
  severity: "info" | "warning" | "critical";
  enabled: boolean;
}

export interface Alert {
  id: string;
  thresholdId: string;
  severity: "info" | "warning" | "critical";
  status: "active" | "resolved" | "acknowledged";
  title: string;
  message: string;
  entity: string; // node name, service name, etc.
  entityType: "node" | "service" | "cluster";
  value: number;
  threshold: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface AlertStats {
  total: number;
  active: number;
  critical: number;
  warning: number;
  info: number;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: "webhook" | "email" | "slack" | "discord";
  enabled: boolean;
  config: Record<string, unknown>;
}
