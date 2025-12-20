/**
 * Application Constants
 * Centralized configuration for mock data generation and dashboard settings
 */

// Node resource ranges
export const NODE_RESOURCE_RANGES = {
  MINIPC_01: {
    CPU: { min: 40, max: 55 },
    MEMORY: { min: 65, max: 75 },
    MEMORY_USED: { min: 10, max: 12 },
  },
  MINIPC_02: {
    CPU: { min: 28, max: 38 },
    MEMORY: { min: 48, max: 58 },
    MEMORY_USED: { min: 7.5, max: 9.5 },
  },
  RASPBERRY_PI: {
    CPU: { min: 15, max: 25 },
    MEMORY: { min: 35, max: 45 },
    MEMORY_USED: { min: 2.8, max: 3.6 },
  },
  BANANA_BOARD: {
    CPU: { min: 20, max: 30 },
    MEMORY: { min: 40, max: 50 },
    MEMORY_USED: { min: 1.6, max: 2 },
  },
} as const;

// Uptime ranges
export const UPTIME_RANGES = {
  DAYS: { min: 20, max: 30 },
  HOURS: { min: 0, max: 24 },
  MINUTES: { min: 0, max: 60 },
} as const;

// Historical data configuration
export const HISTORICAL_DATA = {
  CPU: {
    BASE_LOAD: 40,
    VARIANCE: 10,
  },
  MEMORY: {
    BASE_LOAD: 65,
    VARIANCE: 5,
  },
  NETWORK_TRAFFIC: {
    NIGHT: {
      IN: { min: 0.5, max: 1.5 },
      OUT: { min: 0.3, max: 1.0 },
    },
    DAY: {
      IN: { min: 2.5, max: 4.5 },
      OUT: { min: 1.6, max: 3.0 },
    },
  },
  SPEED_TEST: {
    DOWNLOAD: { min: 180, max: 220 },
    UPLOAD: { min: 80, max: 100 },
    PING: { min: 8, max: 15 },
  },
} as const;

// Downtime incident configuration
export const DOWNTIME_INCIDENTS = {
  HISTORY_DAYS: [7, 10, 15],
  DURATIONS: {
    SHORT: { min: 3, max: 8 },
    MEDIUM: { min: 10, max: 20 },
  },
} as const;

// Time configuration (in hours)
export const TIME_POINTS = [
  24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2,
] as const;

// Chart colors (matching Claude-inspired palette from globals.css)
export const CHART_COLORS = {
  CLAUDE_LAVENDER: "#9090ff",
  CLAUDE_MINT: "#a8d5ba",
  CLAUDE_PEACH: "#ffc79d",
  CLAUDE_SUNSHINE: "#ffd79d",
  CLAUDE_SKY: "#b0d4f1",
  CLAUDE_ROSE: "#ffb3ba",
} as const;

// External links
export const EXTERNAL_LINKS = {
  UPTIME_MONITOR: "https://duyet.github.io/uptime/",
} as const;

// Dashboard refresh interval (milliseconds)
export const REFRESH_INTERVAL = 60000; // 1 minute

// Service namespaces
export const SERVICE_NAMESPACES = [
  "ingress",
  "management",
  "monitoring",
  "llm",
  "analytics",
  "n8n",
  "home-assistant",
  "network",
] as const;

export type ServiceNamespace = (typeof SERVICE_NAMESPACES)[number];
