/**
 * Service mock data generation
 */

import type { Service } from "./types";
import { generateUptime, random } from "./utils";

interface ServiceConfig {
  name: string;
  namespace: string;
  node: string;
  port: number;
  cpuRange: [number, number];
  memRange: [number, number];
}

const serviceConfigs: ServiceConfig[] = [
  {
    name: "traefik",
    namespace: "ingress",
    node: "minipc-01",
    port: 80,
    cpuRange: [1.5, 2.5],
    memRange: [200, 300],
  },
  {
    name: "portainer",
    namespace: "management",
    node: "minipc-01",
    port: 9000,
    cpuRange: [1, 2],
    memRange: [400, 600],
  },
  {
    name: "prometheus",
    namespace: "monitoring",
    node: "minipc-01",
    port: 9090,
    cpuRange: [2.5, 4],
    memRange: [800, 1200],
  },
  {
    name: "litellm",
    namespace: "llm",
    node: "minipc-01",
    port: 4000,
    cpuRange: [3, 5],
    memRange: [600, 900],
  },
  {
    name: "open-webui",
    namespace: "llm",
    node: "minipc-01",
    port: 8080,
    cpuRange: [2, 4],
    memRange: [500, 800],
  },
  {
    name: "clickhouse-monitoring-ui",
    namespace: "analytics",
    node: "minipc-01",
    port: 3000,
    cpuRange: [1.5, 2.5],
    memRange: [300, 500],
  },
  {
    name: "litellm-postgres-1",
    namespace: "llm",
    node: "minipc-02",
    port: 5433,
    cpuRange: [1.5, 3],
    memRange: [400, 700],
  },
  {
    name: "litellm-prometheus-1",
    namespace: "llm",
    node: "minipc-02",
    port: 9091,
    cpuRange: [0.5, 1.5],
    memRange: [200, 400],
  },
  {
    name: "duyetbot",
    namespace: "llm",
    node: "minipc-02",
    port: 8081,
    cpuRange: [2, 4],
    memRange: [400, 700],
  },
  {
    name: "clickhouse",
    namespace: "analytics",
    node: "minipc-02",
    port: 8123,
    cpuRange: [5, 8],
    memRange: [1500, 2000],
  },
  {
    name: "n8n",
    namespace: "n8n",
    node: "minipc-02",
    port: 5678,
    cpuRange: [2.5, 4.5],
    memRange: [700, 1000],
  },
  {
    name: "n8n-postgres-1",
    namespace: "n8n",
    node: "minipc-02",
    port: 5434,
    cpuRange: [1, 2.5],
    memRange: [400, 700],
  },
  {
    name: "n8n-redis-1",
    namespace: "n8n",
    node: "minipc-02",
    port: 6380,
    cpuRange: [0.5, 1.5],
    memRange: [200, 400],
  },
  {
    name: "n8n-n8n-worker-1",
    namespace: "n8n",
    node: "minipc-02",
    port: 5679,
    cpuRange: [1.5, 3],
    memRange: [500, 800],
  },
  {
    name: "home-assistant",
    namespace: "home-assistant",
    node: "rp-01",
    port: 8123,
    cpuRange: [3, 5],
    memRange: [600, 900],
  },
  {
    name: "pihole",
    namespace: "network",
    node: "rp-01",
    port: 53,
    cpuRange: [0.5, 1.2],
    memRange: [200, 350],
  },
  {
    name: "grafana",
    namespace: "monitoring",
    node: "rp-01",
    port: 3001,
    cpuRange: [2, 3.5],
    memRange: [400, 600],
  },
  {
    name: "node-exporter",
    namespace: "monitoring",
    node: "dienquangsmart",
    port: 9100,
    cpuRange: [0.3, 0.8],
    memRange: [100, 200],
  },
];

/**
 * Generate running services with dynamic CPU/Memory usage
 */
export const services: Service[] = serviceConfigs.map((config) => ({
  name: config.name,
  namespace: config.namespace,
  status: "running" as const,
  node: config.node,
  port: config.port,
  uptime: generateUptime(),
  cpu: Number(random(config.cpuRange[0], config.cpuRange[1]).toFixed(1)),
  memory: Math.floor(random(config.memRange[0], config.memRange[1])),
}));
