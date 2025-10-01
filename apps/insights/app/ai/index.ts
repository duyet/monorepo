/**
 * CCUsage Module - Centralized exports
 * Clean public API for the CCUsage components and utilities
 */

// ============================================================================
// Component Exports
// ============================================================================

export { CCUsageActivity } from './activity'
export { CCUsageCosts } from './costs'
export { DateFilter } from './date-filter'
export { CCUsageMetrics } from './metrics'
export { CCUsageModels } from './models'
export { StaticDateFilter } from './static-date-filter'

// ============================================================================
// Error Boundary Exports
// ============================================================================

export {
  CCUsageErrorBoundary,
  CCUsageErrorDisplay,
  useCCUsageErrorBoundary,
} from './error-boundary'

// ============================================================================
// Hook Exports
// ============================================================================

export {
  DATE_RANGES,
  useCostChartData,
  useDailyCostData,
  useDateRange,
  useErrorHandler,
  useFormattedCurrency,
  useModelChartData,
  useModelNameFormatter,
  usePerformanceMonitor,
  useProcessedCosts,
  useProcessedMetrics,
  useTokenChartData,
} from './hooks'

// ============================================================================
// Utility Function Exports (Deprecated - Use hooks instead)
// ============================================================================

export {
  formatCurrency,
  getCCUsageActivity,
  getCCUsageCosts,
  getCCUsageEfficiency, // @deprecated Use useFormattedCurrency hook
  getCCUsageMetrics,
  getCCUsageModels,
  getCCUsageProjects,
} from './ccusage-utils'

// ============================================================================
// Type Exports
// ============================================================================

export type {
  CCUsageActivityData,
  CCUsageActivityProps,
  CCUsageCostData,
  CCUsageCostsProps,
  CCUsageEfficiencyData,
  // Data model types
  CCUsageMetricsData,
  // Component prop types
  CCUsageMetricsProps,
  CCUsageModelData,
  CCUsageModelsProps,
  CCUsageProjectData,
  // Chart data types
  ChartDataPoint,
  // Utility types
  ClickHouseConfig,
  CostChartData,
  DateFilterProps,
  DateRangeConfig,
  // Base types
  DateRangeDays,
  FormatOptions,
  LanguageBarChartData,
  ModelChartData,
  QueryResult,
  StaticDateFilterProps,
  TokenChartData,
  UseCCUsageActivity,
  UseCCUsageCosts,
  // Hook return types
  UseCCUsageMetrics,
  UseCCUsageModels,
  UseFormattedCurrency,
} from './types'

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Legacy DateRange type
export type { DateRangeConfig as DateRange } from './types'
