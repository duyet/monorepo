/**
 * Mock Data Aggregator
 * Central export point for all mock data modules
 */

// Export downtime data
export { downtimeHistory } from "./downtime";
// Export network data
export { networkTraffic, speedTest } from "./network";
// Export node data
export { clusterStats, cpuHistory, memoryHistory, nodes } from "./nodes";
// Export service data
export { services } from "./services";
// Export types
export type {
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

// Export smart device data
export {
  boschWashingMachine,
  dysonAirPurifier,
  smartDevices,
} from "./smart-devices";

// Re-export utilities for convenience
export { generateUptime, getHistoricalTime, random } from "./utils";
