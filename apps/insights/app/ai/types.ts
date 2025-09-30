/**
 * TypeScript interfaces for CCUsage components
 */

// ============================================================================
// Common Types
// ============================================================================

export type DateRangeDays = number | 'all'

export interface DateRangeConfig {
  label: string
  value: string
  days: DateRangeDays
}

// ============================================================================
// Data Model Interfaces (ClickHouse Response Types)
// ============================================================================

export interface CCUsageMetricsData {
  totalTokens: number
  dailyAverage: number
  activeDays: number
  cacheTokens: number
  totalCost: number
  topModel: string
}

export interface CCUsageActivityData {
  date: string
  'Total Tokens': number
  'Input Tokens': number
  'Output Tokens': number
  'Cache Tokens': number
  'Total Cost': number
  [key: string]: string | number
}

export interface CCUsageModelData {
  name: string
  tokens: number
  cost: number
  percent: number
  costPercent: number
  usageCount: number
}

export interface CCUsageCostData {
  date: string
  'Total Cost': number
  'Input Cost': number
  'Output Cost': number
  'Cache Cost': number
  [key: string]: string | number
}

export interface CCUsageProjectData {
  projectName: string
  tokens: number
  relativeUsage: number
  lastActivity: string
}

export interface CCUsageEfficiencyData {
  date: string
  'Efficiency Score': number
  [key: string]: string | number
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

export interface CCUsageBaseProps {
  days?: DateRangeDays
  className?: string
}

export type CCUsageMetricsProps = CCUsageBaseProps

export type CCUsageActivityProps = CCUsageBaseProps

export type CCUsageModelsProps = CCUsageBaseProps

export type CCUsageCostsProps = CCUsageBaseProps

export interface DateFilterProps {
  defaultValue?: string
  onValueChange: (range: DateRangeConfig) => void
  className?: string
}

export interface StaticDateFilterProps {
  currentPeriod?: string
  className?: string
}

// ============================================================================
// Chart Data Transformation Interfaces
// ============================================================================

export interface ChartDataPoint {
  [key: string]: string | number
}

export interface TokenChartData extends ChartDataPoint {
  date: string
  'Input Tokens': number
  'Output Tokens': number
  'Cache Tokens': number
}

export interface CostChartData extends ChartDataPoint {
  date: string
  'Input Cost': number
  'Output Cost': number
  'Cache Cost': number
}

export interface ModelChartData extends ChartDataPoint {
  name: string
  percent: number
}

export interface LanguageBarChartData {
  name: string
  percent: number
  color?: string
}

// ============================================================================
// Utility Function Types
// ============================================================================

export interface ClickHouseConfig {
  host: string
  port: string
  username: string
  password: string
  database: string
  protocol?: string
}

export interface QueryResult {
  success: boolean
  data: Record<string, unknown>[]
  error?: string
}

export interface FormatOptions {
  currency?: string
  decimals?: number
  showSymbol?: boolean
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseCCUsageMetrics {
  data: CCUsageMetricsData | null
  loading: boolean
  error: string | null
}

export interface UseCCUsageActivity {
  data: CCUsageActivityData[]
  loading: boolean
  error: string | null
}

export interface UseCCUsageModels {
  data: CCUsageModelData[]
  tokenChartData: ModelChartData[]
  costChartData: ModelChartData[]
  loading: boolean
  error: string | null
}

export interface UseCCUsageCosts {
  data: CCUsageCostData[]
  summary: {
    total: number
    average: number
    projected: number
  }
  loading: boolean
  error: string | null
}

export interface UseFormattedCurrency {
  format: (amount: number, options?: FormatOptions) => string
  formatTokens: (tokens: number) => string
}