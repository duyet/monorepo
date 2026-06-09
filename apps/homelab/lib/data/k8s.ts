/**
 * Kubernetes cluster mock data
 */

export interface K8sNamespace {
  name: string;
  status: "active" | "terminating";
  pods: number;
  deployments: number;
}

export interface K8sPod {
  name: string;
  namespace: string;
  node: string;
  status: "running" | "pending" | "crashloop" | "completed";
  restarts: number;
  cpu: string;
  memory: string;
  age: string;
}

export const k8sNamespaces: K8sNamespace[] = [
  { name: "ingress", status: "active", pods: 2, deployments: 1 },
  { name: "management", status: "active", pods: 2, deployments: 1 },
  { name: "monitoring", status: "active", pods: 4, deployments: 3 },
  { name: "llm", status: "active", pods: 6, deployments: 4 },
  { name: "analytics", status: "active", pods: 3, deployments: 2 },
  { name: "n8n", status: "active", pods: 5, deployments: 3 },
  { name: "home-assistant", status: "active", pods: 2, deployments: 1 },
  { name: "network", status: "active", pods: 2, deployments: 1 },
  { name: "agents", status: "active", pods: 3, deployments: 2 },
  { name: "kube-system", status: "active", pods: 8, deployments: 5 },
];

export const k8sPods: K8sPod[] = [
  { name: "traefik-7d9f8b6c4-x2k9p", namespace: "ingress", node: "minipc-01", status: "running", restarts: 0, cpu: "50m", memory: "128Mi", age: "25d" },
  { name: "traefik-7d9f8b6c4-m4j2n", namespace: "ingress", node: "minipc-02", status: "running", restarts: 0, cpu: "45m", memory: "115Mi", age: "25d" },
  { name: "portainer-5c8f7d9b2-k1h3q", namespace: "management", node: "minipc-01", status: "running", restarts: 1, cpu: "30m", memory: "256Mi", age: "12d" },
  { name: "prometheus-6b7e8c3a1-p9r2t", namespace: "monitoring", node: "minipc-01", status: "running", restarts: 0, cpu: "120m", memory: "512Mi", age: "25d" },
  { name: "grafana-4d5e6f7a2-w8y1v", namespace: "monitoring", node: "rp-01", status: "running", restarts: 0, cpu: "80m", memory: "256Mi", age: "25d" },
  { name: "node-exporter-3a4b5c6d7-x2m4n", namespace: "monitoring", node: "dienquangsmart", status: "running", restarts: 0, cpu: "15m", memory: "64Mi", age: "25d" },
  { name: "litellm-8e9f0a1b2-q7k3j", namespace: "llm", node: "minipc-01", status: "running", restarts: 2, cpu: "200m", memory: "384Mi", age: "8d" },
  { name: "open-webui-9a0b1c2d3-f5h8l", namespace: "llm", node: "minipc-01", status: "running", restarts: 0, cpu: "150m", memory: "320Mi", age: "8d" },
  { name: "litellm-postgres-0", namespace: "llm", node: "minipc-02", status: "running", restarts: 0, cpu: "60m", memory: "256Mi", age: "25d" },
  { name: "duyetbot-2e3f4a5b6-c7d9g", namespace: "llm", node: "minipc-02", status: "running", restarts: 5, cpu: "5m", memory: "32Mi", age: "3d" },
  { name: "duyetbot-2e3f4a5b6-h2j4k", namespace: "llm", node: "minipc-02", status: "completed", restarts: 0, cpu: "0m", memory: "0Mi", age: "3d" },
  { name: "clickhouse-7b8c9d0e1-n3p5r", namespace: "analytics", node: "minipc-02", status: "running", restarts: 0, cpu: "300m", memory: "768Mi", age: "25d" },
  { name: "clickhouse-monitoring-ui-1a2b3c4d-t6v8w", namespace: "analytics", node: "minipc-01", status: "running", restarts: 0, cpu: "40m", memory: "128Mi", age: "12d" },
  { name: "n8n-4c5d6e7f8-y1a3b", namespace: "n8n", node: "minipc-02", status: "running", restarts: 1, cpu: "180m", memory: "512Mi", age: "10d" },
  { name: "n8n-postgres-0", namespace: "n8n", node: "minipc-02", status: "running", restarts: 0, cpu: "50m", memory: "192Mi", age: "25d" },
  { name: "n8n-redis-0", namespace: "n8n", node: "minipc-02", status: "running", restarts: 0, cpu: "20m", memory: "64Mi", age: "25d" },
  { name: "n8n-worker-5d6e7f8a9-m2n4p", namespace: "n8n", node: "minipc-02", status: "running", restarts: 0, cpu: "100m", memory: "256Mi", age: "10d" },
  { name: "n8n-worker-5d6e7f8a9-q7r9s", namespace: "n8n", node: "minipc-02", status: "running", restarts: 0, cpu: "95m", memory: "248Mi", age: "10d" },
  { name: "home-assistant-6e7f8a9b0-d1e3f", namespace: "home-assistant", node: "rp-01", status: "running", restarts: 3, cpu: "200m", memory: "384Mi", age: "5d" },
  { name: "pihole-7f8a9b0c1-g4h6i", namespace: "network", node: "rp-01", status: "running", restarts: 0, cpu: "25m", memory: "96Mi", age: "25d" },
  { name: "hermes-agent-8a9b0c1d2-j5k7l", namespace: "agents", node: "hermes-agent", status: "running", restarts: 1, cpu: "250m", memory: "512Mi", age: "4d" },
  { name: "hermes-redis-0", namespace: "agents", node: "hermes-agent", status: "running", restarts: 0, cpu: "20m", memory: "64Mi", age: "4d" },
  { name: "hermes-scheduler-9b0c1d2e3-m8n0p", namespace: "agents", node: "hermes-agent", status: "running", restarts: 0, cpu: "80m", memory: "192Mi", age: "4d" },
];

export const k8sSummary = {
  namespaces: k8sNamespaces.length,
  pods: k8sPods.length,
  running: k8sPods.filter((p) => p.status === "running").length,
  deployments: k8sNamespaces.reduce((acc, ns) => acc + ns.deployments, 0),
  totalRestarts: k8sPods.reduce((acc, p) => acc + p.restarts, 0),
};
