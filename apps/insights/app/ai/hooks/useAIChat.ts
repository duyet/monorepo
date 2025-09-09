'use client'

import { useState, useCallback, useRef } from 'react'
import { nanoid } from 'nanoid'
import { aiClient } from '../lib/ai-client'
import { DataAggregator } from '../lib/data-aggregator'
import type { ChatMessage, AIModelConfig } from '../types'

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [modelConfig, setModelConfig] = useState<AIModelConfig>({
    modelName: 'transformers.js',
    loaded: false,
  })

  const dataAggregator = useRef(new DataAggregator())
  const initialized = useRef(false)

  const initializeAI = useCallback(async () => {
    if (initialized.current) return
    
    try {
      setIsLoading(true)
      const config = await aiClient.initialize()
      setModelConfig(config)
      initialized.current = true

      // Add welcome message once AI is loaded
      if (config.loaded) {
        const welcomeMessage: ChatMessage = {
          id: nanoid(),
          content: `Hello! I'm your AI analytics assistant. I can help you understand your development metrics across GitHub, WakaTime, Cloudflare, PostHog, and Claude Code usage.

Try asking me things like:
• "Show me my GitHub activity this week"
• "What are my coding trends this month?"
• "How's my website traffic performing?"
• "Analyze my productivity patterns"
• "Give me insights about my development workflow"`,
          role: 'assistant',
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Failed to initialize AI:', error)
      setModelConfig({
        modelName: 'transformers.js',
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // Add user message
      const userMessage: ChatMessage = {
        id: nanoid(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      }

      // Add loading assistant message
      const loadingMessage: ChatMessage = {
        id: nanoid(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isLoading: true,
      }

      setMessages((prev) => [...prev, userMessage, loadingMessage])
      setIsLoading(true)

      try {
        // Process the query with AI
        const analyticsQuery = await aiClient.processQuery(content)

        // Get relevant data
        const insights = await dataAggregator.current.aggregateData(
          analyticsQuery.intent,
        )

        // Generate AI response
        const response = await aiClient.generateResponse(
          analyticsQuery,
          insights.data,
        )

        // Combine AI response with insights
        const fullResponse = `${response}

${insights.summary}

${insights.recommendations ? `**Recommendations:**\n${insights.recommendations.map(r => `• ${r}`).join('\n')}` : ''}`

        // Update the loading message with the actual response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: fullResponse,
                  isLoading: false,
                }
              : msg,
          ),
        )
      } catch (error) {
        console.error('Failed to process message:', error)
        
        // Update loading message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: `I'm sorry, I encountered an error processing your request. ${
                    error instanceof Error ? error.message : 'Please try again.'
                  }`,
                  isLoading: false,
                }
              : msg,
          ),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    dataAggregator.current.clearCache()
  }, [])

  const retryMessage = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1 || messageIndex === 0) return

      const userMessage = messages[messageIndex - 1]
      if (userMessage.role !== 'user') return

      // Remove the failed message and retry
      setMessages((prev) => prev.slice(0, messageIndex))
      await sendMessage(userMessage.content)
    },
    [messages, sendMessage],
  )

  return {
    messages,
    isLoading,
    modelConfig,
    sendMessage,
    clearMessages,
    retryMessage,
    initializeAI,
  }
}