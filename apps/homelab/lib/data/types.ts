/**
 * Type definitions for mock data
 */

export interface Node {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  type: "minipc" | "raspberry-pi" | "banana-board" | "server";
  cpu: number; // percentage
  memory: number; // percentage
  memoryUsed: number; // GB
  memoryTotal: number; // GB
  storage: number; // GB
  uptime: string;
  services: number;
}

export interface Service {
  name: string;
  namespace: string;
  status: "running" | "stopped" | "error";
  node: string;
  port: number;
  uptime: string;
  cpu: number;
  memory: number;
}

export interface NetworkStats {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  timestamp: string;
}

export interface NetworkSpeedTest {
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  timestamp: string;
}

export interface ServiceDowntime {
  service: string;
  start: string;
  end: string;
  duration: string;
  reason: string;
}

export interface ClusterStats {
  totalNodes: number;
  onlineNodes: number;
  totalServices: number;
  runningServices: number;
  avgCpu: number;
  avgMemory: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
}

/**
 * Smart device types
 */

export interface MonthlyConsumption {
  month: string;
  value: number;
}

export interface WashingMachineData {
  model: string;
  brand: "bosch";
  status: "online" | "offline" | "idle";
  lifetimeCycles: number;
  waterConsumption: {
    monthlyAverage: number;
    unit: "L";
    monthly: MonthlyConsumption[];
  };
  energyConsumption: {
    monthlyAverage: number;
    unit: "kWh";
    monthly: MonthlyConsumption[];
  };
}

export interface SmartDevice {
  id: string;
  name: string;
  brand: string;
  type: "washing-machine" | "vacuum" | "air-purifier" | "thermostat" | "other";
  status: "online" | "offline" | "idle";
  icon: string;
}
