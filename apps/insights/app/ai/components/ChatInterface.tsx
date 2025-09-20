'use client'

import { useEffect, useRef } from 'react'
import { useAIChat } from '../hooks/useAIChat'
import { MessageList } from './MessageList'
import { QueryInput } from './QueryInput'
import { WelcomeScreen } from './WelcomeScreen'
import { LoadingIndicator } from './LoadingIndicator'

export function ChatInterface() {
  const {
    messages,
    isLoading,
    modelConfig,
    sendMessage,
    clearMessages,
    retryMessage,
    initializeAI,
  } = useAIChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAI()
  }, [initializeAI])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!modelConfig.loaded) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingIndicator size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            {modelConfig.error
              ? `Error: ${modelConfig.error}`
              : 'Initializing AI assistant...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="text-lg font-semibold">AI Analytics Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Powered by transformers.js • Privacy-first
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <WelcomeScreen onExampleClick={sendMessage} />
        ) : (
          <>
            <MessageList
              messages={messages}
              onRetry={retryMessage}
              isLoading={isLoading}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <QueryInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          placeholder="Ask me about your development metrics..."
        />
        
        {messages.length > 0 && (
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>All processing happens locally for privacy</span>
            <button
              onClick={clearMessages}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Clear chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}