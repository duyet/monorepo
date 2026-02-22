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

export interface DailyConsumption {
  date: string;
  value: number;
}

export interface ConsumptionData {
  monthlyAverage: number;
  unit: string;
  monthly: MonthlyConsumption[];
  daily: DailyConsumption[];
}

export interface WashingMachineData {
  model: string;
  brand: "bosch";
  status: "online" | "offline" | "idle";
  lifetimeCycles: number;
  waterConsumption: ConsumptionData & { unit: "L" };
  energyConsumption: ConsumptionData & { unit: "kWh" };
}

export interface SmartDevice {
  id: string;
  name: string;
  brand: string;
  type: "washing-machine" | "vacuum" | "air-purifier" | "thermostat" | "other";
  status: "online" | "offline" | "idle";
  icon: string;
}

/**
 * Dyson Air Purifier types
 */

export type AirQualityLevel =
  | "good"
  | "fair"
  | "moderate"
  | "poor"
  | "very-poor";

export interface PollutantReading {
  label: string;
  shortLabel: string;
  value: number;
  unit: string;
  level: AirQualityLevel;
}

export interface AirQualityHistoryPoint {
  time: string;
  pm25: number;
  pm10: number;
  voc: number;
  no2: number;
  hcho: number;
  temperature: number;
  humidity: number;
}

export interface FilterStatus {
  name: string;
  remainingPercent: number;
  remainingMonths: number;
}

export interface AirQualityReport {
  comparedToLastMonth: "improved" | "deteriorated" | "stable";
  highestPollutionDay: string;
  highestPollutionDate: string;
  aqiRating: AirQualityLevel;
  dominantPollutant: string;
}

export interface DysonAirPurifierData {
  model: string;
  modelCode: string;
  brand: "dyson";
  status: "online" | "offline" | "idle";
  currentTemperature: number;
  currentHumidity: number;
  airQuality: AirQualityLevel;
  pollutants: PollutantReading[];
  history: AirQualityHistoryPoint[];
  filters: FilterStatus[];
  report: AirQualityReport;
}
