/**
 * Mock Data Aggregator
 * Central export point for all mock data modules
 */

// Export agent action data
export { agentActions } from "./agent-actions";
// Export downtime data
export { downtimeHistory } from "./downtime";
// Export k8s data
export { k8sNamespaces, k8sPods, k8sSummary } from "./k8s";
// Export network data
export { networkTraffic, speedTest } from "./network";
// Export node data
export { clusterStats, cpuHistory, memoryHistory, nodes } from "./nodes";
// Export service data
export { services } from "./services";
// Export smart device data
export {
  boschWashingMachine,
  dysonAirPurifier,
  smartDevices,
} from "./smart-devices";
// Export types
export type {
  AgentAction,
  K8sNamespace,
  K8sPod,
  AirQualityHistoryPoint,
  AirQualityLevel,
  AirQualityReport,
  ClusterStats,
  ConsumptionData,
  DailyConsumption,
  DysonAirPurifierData,
  FilterStatus,
  MonthlyConsumption,
  NetworkSpeedTest,
  NetworkStats,
  Node,
  PollutantReading,
  Service,
  ServiceDowntime,
  SmartDevice,
  WashingMachineData,
} from "./types";

// Re-export utilities for convenience
export { generateUptime, getHistoricalTime, random } from "./utils";
