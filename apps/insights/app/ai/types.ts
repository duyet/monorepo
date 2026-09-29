/**
 * TypeScript interfaces for CCUsage components
 */

// ============================================================================
// Common Types
// ============================================================================

export type DateRangeDays = number | "all";
// ============================================================================
// Data Model Interfaces (ClickHouse Response Types)
// ============================================================================

export interface CCUsageMetricsData {
  totalTokens: number;
  dailyAverage: number;
  activeDays: number;
  cacheTokens: number;
  totalCost: number;
  topModel: string;
}

export interface CCUsageActivityData {
  date: string;
  "Total Tokens": number;
  "Input Tokens": number;
  "Output Tokens": number;
  "Cache Tokens": number;
  "Total Cost": number;
  [key: string]: string | number;
}

export interface CCUsageModelData {
  name: string;
  tokens: number;
  cost: number;
  percent: number;
  costPercent: number;
  usageCount: number;
}

export interface CCUsageCostData {
  date: string;
  "Total Cost": number;
  "Input Cost": number;
  "Output Cost": number;
  "Cache Cost": number;
  [key: string]: string | number;
}

export interface CCUsageProjectData {
  projectName: string;
  tokens: number;
  relativeUsage: number;
  lastActivity: string;
}

export interface CCUsageEfficiencyData {
  date: string;
  "Efficiency Score": number;
  [key: string]: string | number;
}

export interface CCUsageActivityByModelData {
  date: string;
  [modelName: string]: number | string; // Dynamic keys for each model
}
// ============================================================================
// Chart Data Transformation Interfaces
// ============================================================================

export interface ChartDataPoint {
  [key: string]: string | number;
}
export interface CostChartData extends ChartDataPoint {
  date: string;
  "Input Cost": number;
  "Output Cost": number;
  "Cache Cost": number;
}

export interface ModelChartData extends ChartDataPoint {
  name: string;
  percent: number;
}
// `ClickHouseConfig` and `QueryResult` used to live here and are now defined
// once in `@duyet/config/clickhouse`, which both insights and data-sync bind to.
// Re-exported so existing `@/app/ai/types` importers keep resolving.
export type {
  ClickHouseConfig,
  QueryResult,
} from "@duyet/config/clickhouse";