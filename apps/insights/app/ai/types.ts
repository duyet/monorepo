export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
}

export interface AnalyticsQuery {
  query: string
  intent: QueryIntent
  parameters: Record<string, string | number | boolean | string[] | number[]>
}

export interface QueryIntent {
  type: 'summary' | 'trend' | 'comparison' | 'anomaly' | 'recommendation'
  dataSource: 'github' | 'wakatime' | 'cloudflare' | 'posthog' | 'ccusage' | 'all'
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export interface AnalyticsData {
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface InsightResponse {
  summary: string
  data?: AnalyticsData
  visualizations?: ChartData[]
  recommendations?: string[]
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface AIModelConfig {
  modelName: string
  loaded: boolean
  error?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  lastActive: Date
}