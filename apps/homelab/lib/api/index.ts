/**
 * Unified API Client
 * Combines Prometheus, Grafana, and custom data sources
 */

import { getPrometheusClient } from "./prometheus";
import { getGrafanaClient } from "./grafana";

export { getPrometheusClient, PrometheusClient, resetPrometheusClient } from "./prometheus";
export { getGrafanaClient, GrafanaClient, resetGrafanaClient } from "./grafana";

export type { PrometheusQueryResult, PrometheusConfig, NodeMetrics, ServiceMetrics } from "./prometheus";
export type { GrafanaConfig, GrafanaDashboard, GrafanaPanel } from "./grafana";

/**
 * API Configuration
 */
export interface ApiConfig {
  prometheusUrl?: string;
  prometheusUsername?: string;
  prometheusPassword?: string;
  grafanaUrl?: string;
  grafanaApiKey?: string;
  grafanaUsername?: string;
  grafanaPassword?: string;
  mockMode?: boolean;
  refreshInterval?: number;
}

/**
 * Main API client class
 */
export class HomelabApiClient {
  private config: ApiConfig;
  private mockMode: boolean;
  private refreshInterval: number;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 5000; // 5 seconds

  constructor(config: ApiConfig = {}) {
    this.config = config;
    this.mockMode = config.mockMode ?? !config.prometheusUrl;
    this.refreshInterval = config.refreshInterval ?? 30000; // 30 seconds default
    this.cache = new Map();
  }

  /**
   * Get cached data or fetch new data
   */
  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Get refresh interval
   */
  getRefreshInterval(): number {
    return this.refreshInterval;
  }

  /**
   * Fetch all dashboard data
   */
  async fetchDashboardData() {
    const prometheus = getPrometheusClient();

    const [nodes, services, network] = await Promise.all([
      this.getCached("nodes", () => this.fetchNodes()),
      this.getCached("services", () => this.fetchServices()),
      this.getCached("network", () => prometheus.getNetworkTraffic(24)),
    ]);

    return {
      nodes,
      services,
      network,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch network traffic data
   */
  async fetchNetworkTraffic(hours: number = 24): Promise<Array<{ time: string; in: number; out: number }>> {
    const prometheus = getPrometheusClient();
    return prometheus.getNetworkTraffic(hours);
  }

  /**
   * Fetch node data
   */
  async fetchNodes() {
    const prometheus = getPrometheusClient();
    const nodes = [
      { id: "node-1", name: "minipc-01", ip: "192.168.1.110" },
      { id: "node-2", name: "minipc-02", ip: "192.168.1.111" },
      { id: "node-3", name: "minipc-03", ip: "192.168.1.112" },
      { id: "node-4", name: "rp-01", ip: "192.168.1.120" },
      { id: "node-5", name: "dienquangsmart", ip: "192.168.1.130" },
    ];

    const nodesWithMetrics = await Promise.all(
      nodes.map(async (node) => {
        const [cpu, memory] = await Promise.all([
          prometheus.getNodeCpu(node.name),
          prometheus.getNodeMemory(node.name),
        ]);

        return {
          ...node,
          status: node.name === "minipc-03" ? "offline" : "online",
          type: node.name.startsWith("minipc") ? "minipc" : node.name.startsWith("rp") ? "raspberry-pi" : "banana-board",
          cpu: Number(cpu.toFixed(1)),
          memory: Number(memory.percentage.toFixed(1)),
          memoryUsed: Number(memory.used.toFixed(2)),
          memoryTotal: node.name.includes("minipc") ? 16 : node.name.startsWith("rp") ? 8 : 4,
          storage: node.name.includes("minipc") ? 512 : node.name.startsWith("rp") ? 128 : 64,
          uptime: this.generateUptime(),
          services: this.getServiceCountForNode(node.name),
        };
      })
    );

    return nodesWithMetrics;
  }

  /**
   * Fetch service data
   */
  async fetchServices() {
    const serviceConfigs = [
      { name: "traefik", namespace: "ingress", node: "minipc-01", port: 80, cpuRange: [1.5, 2.5] as [number, number], memRange: [200, 300] as [number, number] },
      { name: "portainer", namespace: "management", node: "minipc-01", port: 9000, cpuRange: [1, 2], memRange: [400, 600] },
      { name: "prometheus", namespace: "monitoring", node: "minipc-01", port: 9090, cpuRange: [2.5, 4], memRange: [800, 1200] },
      { name: "litellm", namespace: "llm", node: "minipc-01", port: 4000, cpuRange: [3, 5], memRange: [600, 900] },
      { name: "open-webui", namespace: "llm", node: "minipc-01", port: 8080, cpuRange: [2, 4], memRange: [500, 800] },
      { name: "clickhouse-monitoring-ui", namespace: "analytics", node: "minipc-01", port: 3000, cpuRange: [1.5, 2.5], memRange: [300, 500] },
      { name: "litellm-postgres-1", namespace: "llm", node: "minipc-02", port: 5433, cpuRange: [1.5, 3], memRange: [400, 700] },
      { name: "litellm-prometheus-1", namespace: "llm", node: "minipc-02", port: 9091, cpuRange: [0.5, 1.5], memRange: [200, 400] },
      { name: "duyetbot", namespace: "llm", node: "minipc-02", port: 8081, cpuRange: [2, 4], memRange: [400, 700] },
      { name: "clickhouse", namespace: "analytics", node: "minipc-02", port: 8123, cpuRange: [5, 8], memRange: [1500, 2000] },
      { name: "n8n", namespace: "n8n", node: "minipc-02", port: 5678, cpuRange: [2.5, 4.5], memRange: [700, 1000] },
      { name: "n8n-postgres-1", namespace: "n8n", node: "minipc-02", port: 5434, cpuRange: [1, 2.5], memRange: [400, 700] },
      { name: "n8n-redis-1", namespace: "n8n", node: "minipc-02", port: 6380, cpuRange: [0.5, 1.5], memRange: [200, 400] },
      { name: "n8n-n8n-worker-1", namespace: "n8n", node: "minipc-02", port: 5679, cpuRange: [1.5, 3], memRange: [500, 800] },
      { name: "home-assistant", namespace: "home-assistant", node: "rp-01", port: 8123, cpuRange: [3, 5], memRange: [600, 900] },
      { name: "pihole", namespace: "network", node: "rp-01", port: 53, cpuRange: [0.5, 1.2], memRange: [200, 350] },
      { name: "grafana", namespace: "monitoring", node: "rp-01", port: 3001, cpuRange: [2, 3.5], memRange: [400, 600] },
      { name: "node-exporter", namespace: "monitoring", node: "dienquangsmart", port: 9100, cpuRange: [0.3, 0.8], memRange: [100, 200] },
    ];

    return serviceConfigs.map((config) => ({
      name: config.name,
      namespace: config.namespace,
      status: "running" as const,
      node: config.node,
      port: config.port,
      uptime: this.generateUptime(),
      cpu: Number(this.randomInRange(config.cpuRange[0], config.cpuRange[1]).toFixed(1)),
      memory: Math.floor(this.randomInRange(config.memRange[0], config.memRange[1])),
    }));
  }

  /**
   * Helper to generate uptime string
   */
  private generateUptime(): string {
    const days = Math.floor(this.randomInRange(20, 30));
    const hours = Math.floor(this.randomInRange(0, 24));
    const minutes = Math.floor(this.randomInRange(0, 60));
    return `${days}d ${hours}h ${minutes}m`;
  }

  /**
   * Helper to get service count for node
   */
  private getServiceCountForNode(nodeName: string): number {
    const counts: Record<string, number> = {
      "minipc-01": 6,
      "minipc-02": 7,
      "minipc-03": 0,
      "rp-01": 3,
      "dienquangsmart": 1,
    };
    return counts[nodeName] || 0;
  }

  /**
   * Helper for random values
   */
  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Fetch historical data
   */
  async fetchHistoricalData(metric: "cpu" | "memory", hours: number = 24) {
    const data: Array<{ time: string; "minipc-01": number; "minipc-02": number; "minipc-03": number }> = [];
    const now = new Date();

    for (let i = hours; i >= 0; i -= 2) {
      const time = new Date(now.getTime() - i * 3600 * 1000);
      const hour = time.getHours();
      const isNight = hour >= 22 || hour <= 6;

      data.push({
        time: time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        "minipc-01": metric === "cpu"
          ? this.randomInRange(isNight ? 30 : 40, isNight ? 50 : 65)
          : this.randomInRange(isNight ? 55 : 60, isNight ? 70 : 80),
        "minipc-02": metric === "cpu"
          ? this.randomInRange(isNight ? 20 : 25, isNight ? 35 : 42)
          : this.randomInRange(isNight ? 40 : 45, isNight ? 55 : 62),
        "minipc-03": 0,
      });
    }

    // Add current data point
    const prometheus = getPrometheusClient();
    const [cpu1, cpu2] = await Promise.all([
      prometheus.getNodeCpu("minipc-01"),
      prometheus.getNodeCpu("minipc-02"),
    ]);

    data.push({
      time: "Now",
      "minipc-01": cpu1,
      "minipc-02": cpu2,
      "minipc-03": 0,
    });

    return data;
  }
}

/**
 * Create a singleton instance
 */
let apiClient: HomelabApiClient | null = null;

export function getApiClient(): HomelabApiClient {
  if (!apiClient) {
    apiClient = new HomelabApiClient({
      prometheusUrl: process.env.NEXT_PUBLIC_PROMETHEUS_URL,
      prometheusUsername: process.env.PROMETHEUS_USERNAME,
      prometheusPassword: process.env.PROMETHEUS_PASSWORD,
      grafanaUrl: process.env.NEXT_PUBLIC_GRAFANA_URL,
      grafanaApiKey: process.env.GRAFANA_API_KEY,
      grafanaUsername: process.env.GRAFANA_USERNAME,
      grafanaPassword: process.env.GRAFANA_PASSWORD,
      mockMode: process.env.NEXT_PUBLIC_HOMELAB_MOCK_MODE === "true",
      refreshInterval: parseInt(process.env.NEXT_PUBLIC_HOMELAB_REFRESH_INTERVAL || "30000", 10),
    });
  }
  return apiClient;
}

/**
 * Reset the client
 */
export function resetApiClient(): void {
  apiClient = null;
}
