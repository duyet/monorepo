/**
 * Mock Data Aggregator
 * Central export point for all mock data modules
 */

// Export types
export type {
  Node,
  Service,
  NetworkStats,
  NetworkSpeedTest,
  ServiceDowntime,
  ClusterStats,
} from "./types";

// Export node data
export { nodes, cpuHistory, memoryHistory, clusterStats } from "./nodes";

// Export service data
export { services } from "./services";

// Export network data
export { networkTraffic, speedTest } from "./network";

// Export downtime data
export { downtimeHistory } from "./downtime";

// Re-export utilities for convenience
export { random, generateUptime, getHistoricalTime } from "./utils";
