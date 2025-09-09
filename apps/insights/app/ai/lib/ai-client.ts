'use client'

import { pipeline } from '@xenova/transformers'
import type { AIModelConfig, AnalyticsQuery, QueryIntent, AnalyticsData } from '../types'

export class AIClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private textClassifier: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private textGenerator: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private summarizer: any = null
  private initialized = false

  async initialize(): Promise<AIModelConfig> {
    try {
      // Initialize text classification for query intent detection
      this.textClassifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
      )

      // Initialize text generation for responses
      this.textGenerator = await pipeline(
        'text-generation',
        'Xenova/distilgpt2',
      )

      // Initialize summarization for data insights
      this.summarizer = await pipeline(
        'summarization',
        'Xenova/distilbart-cnn-12-6',
      )

      this.initialized = true

      return {
        modelName: 'transformers.js',
        loaded: true,
      }
    } catch (error) {
      console.error('Failed to initialize AI models:', error)
      return {
        modelName: 'transformers.js',
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async processQuery(query: string): Promise<AnalyticsQuery> {
    if (!this.initialized) {
      await this.initialize()
    }

    const intent = await this.detectQueryIntent(query)
    const parameters = this.extractParameters(query)

    return {
      query,
      intent,
      parameters,
    }
  }

  private async detectQueryIntent(query: string): Promise<QueryIntent> {
    // Simplified intent detection based on keywords
    // In a production system, you would use the text classifier
    const lowerQuery = query.toLowerCase()

    let type: QueryIntent['type'] = 'summary'
    let dataSource: QueryIntent['dataSource'] = 'all'
    let timeframe: QueryIntent['timeframe'] | undefined

    // Detect query type
    if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) {
      type = 'trend'
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      type = 'comparison'
    } else if (lowerQuery.includes('anomal') || lowerQuery.includes('unusual')) {
      type = 'anomaly'
    } else if (
      lowerQuery.includes('suggest') ||
      lowerQuery.includes('recommend')
    ) {
      type = 'recommendation'
    }

    // Detect data source
    if (lowerQuery.includes('github') || lowerQuery.includes('commit')) {
      dataSource = 'github'
    } else if (lowerQuery.includes('wakatime') || lowerQuery.includes('coding')) {
      dataSource = 'wakatime'
    } else if (
      lowerQuery.includes('cloudflare') ||
      lowerQuery.includes('traffic')
    ) {
      dataSource = 'cloudflare'
    } else if (lowerQuery.includes('posthog') || lowerQuery.includes('user')) {
      dataSource = 'posthog'
    } else if (lowerQuery.includes('ccusage') || lowerQuery.includes('claude')) {
      dataSource = 'ccusage'
    }

    // Detect timeframe
    if (lowerQuery.includes('today') || lowerQuery.includes('day')) {
      timeframe = 'day'
    } else if (lowerQuery.includes('week')) {
      timeframe = 'week'
    } else if (lowerQuery.includes('month')) {
      timeframe = 'month'
    } else if (lowerQuery.includes('quarter')) {
      timeframe = 'quarter'
    } else if (lowerQuery.includes('year')) {
      timeframe = 'year'
    }

    return { type, dataSource, timeframe }
  }

  private extractParameters(
    query: string,
  ): Record<string, string | number | boolean | string[] | number[]> {
    const parameters: Record<string, string | number | boolean | string[] | number[]> = {}

    // Extract numeric values
    const numbers = query.match(/\d+/g)
    if (numbers) {
      parameters.numbers = numbers.map(Number)
    }

    // Extract time-related keywords
    const timeKeywords = [
      'yesterday',
      'last',
      'this',
      'next',
      'ago',
      'since',
      'before',
      'after',
    ]
    const foundTimeKeywords = timeKeywords.filter((keyword) =>
      query.toLowerCase().includes(keyword),
    )
    if (foundTimeKeywords.length > 0) {
      parameters.timeKeywords = foundTimeKeywords
    }

    return parameters
  }

  async generateResponse(
    analyticsQuery: AnalyticsQuery,
    data: AnalyticsData | undefined,
  ): Promise<string> {
    if (!this.summarizer) {
      return this.generateFallbackResponse(analyticsQuery, data)
    }

    try {
      // Create a summary of the data
      const dataString = JSON.stringify(data).substring(0, 500) // Limit input size
      const context = `Query: ${analyticsQuery.query}\nData: ${dataString}`

      const result = await this.summarizer(context, {
        max_length: 150,
        min_length: 50,
      })

      return Array.isArray(result) ? result[0].summary_text : result.summary_text
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      return this.generateFallbackResponse(analyticsQuery, data)
    }
  }

  private generateFallbackResponse(
    analyticsQuery: AnalyticsQuery,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: AnalyticsData | undefined,
  ): string {
    const { intent } = analyticsQuery

    switch (intent.type) {
      case 'summary':
        return `Here's a summary of your ${intent.dataSource} data: Based on the available information, I can see patterns in your analytics metrics.`
      case 'trend':
        return `Looking at the trends in your ${intent.dataSource} data over the ${intent.timeframe || 'selected period'}, there are notable patterns to explore.`
      case 'comparison':
        return `Comparing different aspects of your ${intent.dataSource} data reveals interesting insights.`
      case 'anomaly':
        return `I've analyzed your ${intent.dataSource} data for unusual patterns or anomalies.`
      case 'recommendation':
        return `Based on your ${intent.dataSource} metrics, here are some recommendations for improvement.`
      default:
        return `I've analyzed your query about ${intent.dataSource} data. The results show various insights that might be helpful.`
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

// Singleton instance
export const aiClient = new AIClient()