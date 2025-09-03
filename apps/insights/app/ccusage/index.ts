/**
 * CCUsage Module - Centralized exports
 * Clean public API for the CCUsage components and utilities
 */

// ============================================================================
// Component Exports
// ============================================================================

export { CCUsageMetrics } from './metrics'
export { CCUsageActivity } from './activity'
export { CCUsageModels } from './models'
export { CCUsageCosts } from './costs'
export { DateFilter } from './date-filter'
export { StaticDateFilter } from './static-date-filter'

// ============================================================================
// Error Boundary Exports
// ============================================================================

export { 
  CCUsageErrorBoundary, 
  CCUsageErrorDisplay, 
  useCCUsageErrorBoundary 
} from './error-boundary'

// ============================================================================
// Hook Exports
// ============================================================================

export {
  useFormattedCurrency,
  useTokenChartData,
  useCostChartData,
  useDailyCostData,
  useModelChartData,
  useProcessedMetrics,
  useProcessedCosts,
  useModelNameFormatter,
  useErrorHandler,
  usePerformanceMonitor,
  useDateRange,
  DATE_RANGES,
} from './hooks'

// ============================================================================
// Utility Function Exports (Deprecated - Use hooks instead)
// ============================================================================

export {
  formatCurrency, // @deprecated Use useFormattedCurrency hook
  getCCUsageMetrics,
  getCCUsageActivity,
  getCCUsageModels,
  getCCUsageCosts,
  getCCUsageProjects,
  getCCUsageEfficiency,
} from './ccusage-utils'

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Base types
  DateRangeDays,
  DateRangeConfig,
  
  // Data model types
  CCUsageMetricsData,
  CCUsageActivityData,
  CCUsageModelData,
  CCUsageCostData,
  CCUsageProjectData,
  CCUsageEfficiencyData,
  
  // Component prop types
  CCUsageMetricsProps,
  CCUsageActivityProps,
  CCUsageModelsProps,
  CCUsageCostsProps,
  DateFilterProps,
  StaticDateFilterProps,
  
  // Chart data types
  ChartDataPoint,
  TokenChartData,
  CostChartData,
  ModelChartData,
  LanguageBarChartData,
  
  // Hook return types
  UseCCUsageMetrics,
  UseCCUsageActivity,
  UseCCUsageModels,
  UseCCUsageCosts,
  UseFormattedCurrency,
  
  // Utility types
  ClickHouseConfig,
  QueryResult,
  FormatOptions,
} from './types'

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Legacy DateRange type
export type { DateRangeConfig as DateRange } from './types'