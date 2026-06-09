/**
 * AI Agent action log — duyetbot-agent automated operations
 */

import type { AgentAction } from "./types";

export const agentActions: AgentAction[] = [
  {
    id: "act-01",
    timestamp: "12m ago",
    type: "health-check",
    description: "All services healthy on minipc-01",
    target: "minipc-01",
    status: "success",
  },
  {
    id: "act-02",
    timestamp: "45m ago",
    type: "auto-restart",
    description: "Restarted n8n after OOM detection",
    target: "n8n",
    status: "success",
  },
  {
    id: "act-03",
    timestamp: "2h ago",
    type: "log-collection",
    description: "Gathered Prometheus metrics for analysis",
    target: "prometheus",
    status: "success",
  },
  {
    id: "act-04",
    timestamp: "3h ago",
    type: "version-upgrade",
    description: "Upgraded traefik 3.1 → 3.2 (security patch)",
    target: "traefik",
    status: "success",
  },
  {
    id: "act-05",
    timestamp: "5h ago",
    type: "security-fix",
    description: "Patched clickhouse TLS configuration",
    target: "clickhouse",
    status: "success",
  },
  {
    id: "act-06",
    timestamp: "6h ago",
    type: "health-check",
    description: "Detected minipc-03 offline, skipped health probe",
    target: "minipc-03",
    status: "success",
  },
  {
    id: "act-07",
    timestamp: "8h ago",
    type: "config-update",
    description: "Updated grafana dashboard JSON",
    target: "grafana",
    status: "success",
  },
  {
    id: "act-08",
    timestamp: "12h ago",
    type: "auto-restart",
    description: "Restarted home-assistant after crash loop",
    target: "home-assistant",
    status: "success",
  },
  {
    id: "act-09",
    timestamp: "18h ago",
    type: "version-upgrade",
    description: "Upgraded litellm 1.40 → 1.41",
    target: "litellm",
    status: "success",
  },
  {
    id: "act-10",
    timestamp: "1d ago",
    type: "health-check",
    description: "Cluster status report generated",
    target: "cluster",
    status: "success",
  },
];
